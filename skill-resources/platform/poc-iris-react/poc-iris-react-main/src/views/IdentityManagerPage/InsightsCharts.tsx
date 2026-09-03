import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { scaleBand, scaleLinear } from 'd3-scale';
import { arc, line as d3line, area as d3area, curveMonotoneX } from 'd3-shape';
import { select } from 'd3-selection';
import { interpolate } from 'd3-interpolate';
import { easeCubicOut } from 'd3-ease';
import 'd3-transition';
import { motionDurationMs, prefersReducedMotion } from '../../lib/motion.js';
import { chartSeriesColor } from '../../lib/chartColors.js';
import styles from './InsightsCharts.module.css';

/** Status → fill, drawn from the theme chart palette (matches the donut). */
export const STATUS_FILL: Record<'web' | 'fat' | 'planned', string> = {
  web: chartSeriesColor(0),
  fat: chartSeriesColor(1),
  planned: chartSeriesColor(2),
};

/** Accent colors for the single-series charts. */
const GAUGE_COLOR = chartSeriesColor(0);
const TREND_COLOR = chartSeriesColor(3);

/** Fixed bar thickness (rendered px). Charts render 1:1 so this is exact. */
const BAR_W = 8;

const dur = () => motionDurationMs('--oi-motion-duration-default') || 600;

/**
 * Measure a container's live pixel width so charts render at 1:1 (viewBox ==
 * pixels). Keeps text un-stretched and lets bar sizes be exact px.
 */
function useMeasuredWidth() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      if (w > 0) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

/* ──────────────────────────────────────────────────────────────────────────
 * GaugeArc — a 270° radial progress gauge (0–1), arc sweeps open on mount.
 * ────────────────────────────────────────────────────────────────────────── */
export function GaugeArc({ value, caption = 'Modernized' }: { value: number; caption?: string }) {
  const VB = 176;
  const R = 66;
  const STROKE = 12;
  const START = -0.75 * Math.PI;
  const END = 0.75 * Math.PI;
  const target = START + Math.max(0, Math.min(1, value)) * (END - START);

  const makeArc = useMemo(
    () =>
      arc<{ startAngle: number; endAngle: number }>()
        .innerRadius(R - STROKE / 2)
        .outerRadius(R + STROKE / 2)
        .cornerRadius(STROKE / 2),
    [],
  );

  const ref = useRef<SVGPathElement | null>(null);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const sel = select(node);
    if (prefersReducedMotion()) {
      sel.attr('d', makeArc({ startAngle: START, endAngle: target }) ?? '');
      return;
    }
    sel
      .attr('d', makeArc({ startAngle: START, endAngle: START }) ?? '')
      .transition()
      .duration(dur())
      .ease(easeCubicOut)
      .attrTween('d', () => {
        const i = interpolate(START, target);
        return (t) => makeArc({ startAngle: START, endAngle: i(t) }) ?? '';
      });
    return () => {
      sel.interrupt();
    };
  }, [target, makeArc]);

  return (
    <div className={styles.gaugeWrap}>
      <svg viewBox={`0 0 ${VB} ${VB}`} className={styles.gaugeSvg} role="img" aria-label={`${Math.round(value * 100)}% ${caption}`}>
        <g transform={`translate(${VB / 2} ${VB / 2})`}>
          <path d={makeArc({ startAngle: START, endAngle: END }) ?? ''} fill="var(--oi-border-color-muted)" />
          <path ref={ref} fill={GAUGE_COLOR} />
        </g>
        <text x={VB / 2} y={VB / 2 - 2} textAnchor="middle" className={styles.gaugeValue}>
          {Math.round(value * 100)}%
        </text>
        <text x={VB / 2} y={VB / 2 + 20} textAnchor="middle" className={styles.gaugeCaption}>
          {caption}
        </text>
      </svg>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * StackedBar — per-group status breakdown (web/fat/planned), segments grow up.
 * ────────────────────────────────────────────────────────────────────────── */
export interface StackedDatum {
  label: string;
  web: number;
  fat: number;
  planned: number;
}

export function StackedBar({ data }: { data: StackedDatum[] }) {
  const [ref, W] = useMeasuredWidth();
  const H = 200;
  const PAD = { top: 8, right: 4, bottom: 24, left: 4 };

  const { segs, labels, gridY, baseline } = useMemo(() => {
    if (!W) return { segs: [], labels: [], gridY: [] as number[], baseline: 0 };
    const plotH = H - PAD.top - PAD.bottom;
    const x = scaleBand<string>()
      .domain(data.map((d) => d.label))
      .range([PAD.left, W - PAD.right])
      .padding(0.2);
    const max = Math.max(...data.map((d) => d.web + d.fat + d.planned), 1);
    const y = scaleLinear().domain([0, max]).range([PAD.top + plotH, PAD.top]);
    const keys = ['web', 'fat', 'planned'] as const;

    const segs = data.flatMap((d, bi) => {
      const cx = (x(d.label) ?? 0) + x.bandwidth() / 2;
      let acc = 0;
      return keys.map((key) => {
        const v = d[key];
        const y0 = y(acc);
        const y1 = y(acc + v);
        acc += v;
        return { key, bi, x: cx - BAR_W / 2, y: y1, h: Math.max(0, y0 - y1) };
      });
    });
    const labels = data.map((d) => ({ label: d.label, cx: (x(d.label) ?? 0) + x.bandwidth() / 2 }));
    const gridY = y.ticks(4).map((t) => y(t));
    return { segs, labels, gridY, baseline: PAD.top + plotH };
  }, [data, W]);

  const gRef = useRef<SVGGElement | null>(null);
  useLayoutEffect(() => {
    const g = gRef.current;
    if (!g) return;
    const rects = select(g).selectAll<SVGRectElement, (typeof segs)[number]>('rect').data(segs);
    if (prefersReducedMotion()) return;
    const d = dur();
    rects
      .attr('y', baseline)
      .attr('height', 0)
      .transition()
      .duration(d)
      .delay((s) => (data.length ? (s.bi * d) / data.length : 0))
      .ease(easeCubicOut)
      .attr('y', (s) => s.y)
      .attr('height', (s) => s.h);
    return () => {
      rects.interrupt();
    };
  }, [segs, baseline, data.length]);

  return (
    <div ref={ref} className={styles.block}>
      {W > 0 && (
        <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} className={styles.svg} role="img" aria-label="Status by area">
          {gridY.map((gy, i) => (
            <line key={i} x1={PAD.left} x2={W - PAD.right} y1={gy} y2={gy} className={styles.gridline} />
          ))}
          <g ref={gRef}>
            {segs.map((s, i) => (
              <rect key={i} x={s.x} y={s.y} width={BAR_W} height={s.h} rx="1.5" fill={STATUS_FILL[s.key]} />
            ))}
          </g>
          {labels.map((l) => (
            <text key={l.label} x={l.cx} y={H - 8} textAnchor="middle" className={styles.axisLabel}>
              {l.label}
            </text>
          ))}
        </svg>
      )}
      <StatusLegend />
    </div>
  );
}

export function StatusLegend() {
  const items: { key: 'web' | 'fat' | 'planned'; label: string }[] = [
    { key: 'web', label: 'Modernized' },
    { key: 'fat', label: 'Fat client' },
    { key: 'planned', label: 'Planned' },
  ];
  return (
    <ul className={styles.legend}>
      {items.map((it) => (
        <li key={it.key} className={styles.legendItem}>
          <span className={styles.dot} style={{ backgroundColor: STATUS_FILL[it.key] }} aria-hidden="true" />
          <span className={styles.legendLabel}>{it.label}</span>
        </li>
      ))}
    </ul>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * VBars — single-series vertical bars (8px), grow up on mount.
 * ────────────────────────────────────────────────────────────────────────── */
export interface BarDatum {
  label: string;
  value: number;
}

export function VBars({ data }: { data: BarDatum[] }) {
  const [ref, W] = useMeasuredWidth();
  const H = 200;
  const PAD = { top: 8, right: 4, bottom: 24, left: 4 };

  const { bars, gridY, baseline } = useMemo(() => {
    if (!W) return { bars: [], gridY: [] as number[], baseline: 0 };
    const plotH = H - PAD.top - PAD.bottom;
    const x = scaleBand<string>()
      .domain(data.map((d) => d.label))
      .range([PAD.left, W - PAD.right])
      .padding(0.2);
    const max = Math.max(...data.map((d) => d.value), 1);
    const y = scaleLinear().domain([0, max]).nice(4).range([PAD.top + plotH, PAD.top]);
    const bars = data.map((d) => {
      const cx = (x(d.label) ?? 0) + x.bandwidth() / 2;
      return { label: d.label, x: cx - BAR_W / 2, cx, y: y(d.value), h: PAD.top + plotH - y(d.value) };
    });
    return { bars, gridY: y.ticks(4).map((t) => y(t)), baseline: PAD.top + plotH };
  }, [data, W]);

  const gRef = useRef<SVGGElement | null>(null);
  useLayoutEffect(() => {
    const g = gRef.current;
    if (!g) return;
    const rects = select(g).selectAll<SVGRectElement, (typeof bars)[number]>('rect').data(bars);
    if (prefersReducedMotion()) return;
    const d = dur();
    rects
      .attr('y', baseline)
      .attr('height', 0)
      .transition()
      .duration(d)
      .delay((_b, i) => (bars.length ? (i * d) / bars.length : 0))
      .ease(easeCubicOut)
      .attr('y', (b) => b.y)
      .attr('height', (b) => b.h);
    return () => {
      rects.interrupt();
    };
  }, [bars, baseline]);

  return (
    <div ref={ref} className={styles.block}>
      {W > 0 && (
        <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} className={styles.svg} role="img" aria-label="Bar chart">
          {gridY.map((gy, i) => (
            <line key={i} x1={PAD.left} x2={W - PAD.right} y1={gy} y2={gy} className={styles.gridline} />
          ))}
          <g ref={gRef}>
            {bars.map((b, i) => (
              <rect key={i} x={b.x} y={b.y} width={BAR_W} height={b.h} rx="1.5" fill={chartSeriesColor(i)} />
            ))}
          </g>
          {bars.map((b) => (
            <text key={b.label} x={b.cx} y={H - 8} textAnchor="middle" className={styles.axisLabel}>
              {b.label}
            </text>
          ))}
        </svg>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * HBars — horizontal % bars (0–1), 8px thick, widths grow on mount.
 * ────────────────────────────────────────────────────────────────────────── */
export function HBars({ data }: { data: BarDatum[] }) {
  const [ref, W] = useMeasuredWidth();
  const ROW = 22;
  const GAP = 12;
  const LABEL_W = 96;
  const PAD_R = 40;
  const H = data.length * (ROW + GAP);

  const { rows, grid, trackX, trackW } = useMemo(() => {
    if (!W) return { rows: [], grid: [] as number[], trackX: 0, trackW: 0 };
    const trackX = LABEL_W;
    const trackW = Math.max(0, W - LABEL_W - PAD_R);
    const rows = data.map((d, i) => ({
      ...d,
      y: i * (ROW + GAP),
      w: Math.max(0, Math.min(1, d.value)) * trackW,
    }));
    const grid = [0, 0.25, 0.5, 0.75, 1].map((f) => trackX + f * trackW);
    return { rows, grid, trackX, trackW };
  }, [data, W]);

  const gRef = useRef<SVGGElement | null>(null);
  useLayoutEffect(() => {
    const g = gRef.current;
    if (!g) return;
    const bars = select(g).selectAll<SVGRectElement, (typeof rows)[number]>('rect.val').data(rows);
    if (prefersReducedMotion()) return;
    const d = dur();
    bars
      .attr('width', 0)
      .transition()
      .duration(d)
      .delay((_r, i) => (rows.length ? (i * d) / rows.length / 1.5 : 0))
      .ease(easeCubicOut)
      .attr('width', (r) => r.w);
    return () => {
      bars.interrupt();
    };
  }, [rows]);

  return (
    <div ref={ref} className={styles.block}>
      {W > 0 && (
        <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} className={styles.svg} role="img" aria-label="Modernization by area">
          {grid.map((gx, i) => (
            <line key={i} x1={gx} x2={gx} y1={0} y2={H} className={styles.gridline} />
          ))}
          <g ref={gRef}>
            {rows.map((r, i) => (
              <g key={i}>
                <text x={0} y={r.y + ROW / 2} dominantBaseline="middle" className={styles.rowLabel}>
                  {r.label}
                </text>
                <rect x={trackX} y={r.y + (ROW - BAR_W) / 2} width={trackW} height={BAR_W} rx="4" fill="var(--oi-border-color-muted)" />
                <rect className="val" x={trackX} y={r.y + (ROW - BAR_W) / 2} width={r.w} height={BAR_W} rx="4" fill={chartSeriesColor(i)} />
                <text x={W} y={r.y + ROW / 2} dominantBaseline="middle" textAnchor="end" className={styles.rowValue}>
                  {Math.round(r.value * 100)}%
                </text>
              </g>
            ))}
          </g>
        </svg>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * AreaTrend — line + gradient area, line draws left→right on mount.
 * ────────────────────────────────────────────────────────────────────────── */
export function AreaTrend({ data, labels }: { data: number[]; labels?: string[] }) {
  const [ref, W] = useMeasuredWidth();
  const H = 160;
  const PAD = { top: 12, right: 10, bottom: 22, left: 10 };

  const { linePath, areaPath, last } = useMemo(() => {
    if (!W) return { linePath: '', areaPath: '', last: { x: 0, y: 0 } };
    const x = scaleLinear().domain([0, Math.max(data.length - 1, 1)]).range([PAD.left, W - PAD.right]);
    const lo = Math.min(...data) * 0.9;
    const hi = Math.max(...data) * 1.02;
    const y = scaleLinear().domain([lo, hi]).range([H - PAD.bottom, PAD.top]);
    const l = d3line<number>().x((_, i) => x(i)).y((d) => y(d)).curve(curveMonotoneX);
    const a = d3area<number>().x((_, i) => x(i)).y0(H - PAD.bottom).y1((d) => y(d)).curve(curveMonotoneX);
    return {
      linePath: l(data) ?? '',
      areaPath: a(data) ?? '',
      last: { x: x(data.length - 1), y: y(data[data.length - 1]) },
    };
  }, [data, W]);

  const lineRef = useRef<SVGPathElement | null>(null);
  const areaRef = useRef<SVGPathElement | null>(null);
  const dotRef = useRef<SVGCircleElement | null>(null);
  useLayoutEffect(() => {
    const lineNode = lineRef.current;
    if (!lineNode || !W) return;
    if (prefersReducedMotion()) return;
    const len = lineNode.getTotalLength();
    const d = dur();
    select(lineNode)
      .attr('stroke-dasharray', `${len} ${len}`)
      .attr('stroke-dashoffset', len)
      .transition()
      .duration(d)
      .ease(easeCubicOut)
      .attr('stroke-dashoffset', 0);
    select(areaRef.current).attr('opacity', 0).transition().duration(d).attr('opacity', 1);
    select(dotRef.current).attr('opacity', 0).transition().delay(d).duration(d / 3).attr('opacity', 1);
    return () => {
      select(lineNode).interrupt();
      select(areaRef.current).interrupt();
      select(dotRef.current).interrupt();
    };
  }, [linePath, W]);

  return (
    <div ref={ref} className={styles.block}>
      {W > 0 && (
        <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} className={styles.svg} role="img" aria-label="Modernization trend">
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={TREND_COLOR} stopOpacity="0.28" />
              <stop offset="100%" stopColor={TREND_COLOR} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path ref={areaRef} d={areaPath} fill="url(#trendFill)" />
          <path ref={lineRef} d={linePath} fill="none" stroke={TREND_COLOR} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <circle ref={dotRef} cx={last.x} cy={last.y} r={3.5} fill={TREND_COLOR} />
          {labels &&
            labels.map((lb, i) =>
              i % 2 === 0 ? (
                <text
                  key={lb + i}
                  x={PAD.left + (i / Math.max(data.length - 1, 1)) * (W - PAD.left - PAD.right)}
                  y={H - 6}
                  textAnchor="middle"
                  className={styles.axisLabel}
                >
                  {lb}
                </text>
              ) : null,
            )}
        </svg>
      )}
    </div>
  );
}
