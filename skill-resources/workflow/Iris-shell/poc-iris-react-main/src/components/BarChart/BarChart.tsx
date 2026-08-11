import { useLayoutEffect, useMemo, useRef } from 'react';
import { scaleBand, scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { easeCubicOut } from 'd3-ease';
import 'd3-transition';
import { cx } from '../../lib/cx.js';
import { motionDurationMs, prefersReducedMotion } from '../../lib/motion.js';
import { Tooltip } from '../Tooltip/Tooltip.js';
import styles from './BarChart.module.css';

export interface BarDatum {
  label: string;
  value: number;
}

export interface BarChartProps {
  data: BarDatum[];
  color?: 'blue' | 'purple';
  /** Number of Y-axis ticks (incl. zero). */
  tickCount?: number;
  height?: number;
  className?: string;
}

/**
 * BarChart — minimal SVG bar chart.
 */
export function BarChart({
  data,
  color = 'blue',
  tickCount = 4,
  height = 200,
  className,
}: BarChartProps) {
  // Pre-compute layout. The SVG draws into a fixed viewBox; widths flow via CSS.
  const VB_WIDTH = 400;
  const VB_HEIGHT = height;
  const PAD = { top: 8, right: 8, bottom: 28, left: 44 };

  const { ticks, bars } = useMemo(() => {
    const plotH = VB_HEIGHT - PAD.top - PAD.bottom;

    const x = scaleBand<string>()
      .domain(data.map((d) => d.label))
      .range([PAD.left, VB_WIDTH - PAD.right])
      .padding(0.5);

    const rawMax = Math.max(...data.map((d) => d.value), 0);
    const y = scaleLinear()
      // Guard against a degenerate [0, 0] domain (all-zero data), which
      // d3-scale otherwise maps to the range midpoint rather than the
      // baseline — breaking gridlines, bar y, and the grow-up animation.
      .domain([0, rawMax || 1])
      .nice(tickCount)
      .range([PAD.top + plotH, PAD.top]);

    return {
      ticks: y.ticks(tickCount),
      bars: data.map((d) => ({
        x: x(d.label) ?? 0,
        y: y(d.value),
        w: x.bandwidth(),
        h: y(0) - y(d.value),
        label: d.label,
        value: d.value,
      })),
    };
  }, [data, tickCount, VB_HEIGHT]);

  const plotH = VB_HEIGHT - PAD.top - PAD.bottom;
  const tickMax = ticks[ticks.length - 1] ?? 0;
  const baseline = PAD.top + plotH;

  // Grow the bars up from the baseline. React renders the final geometry;
  // d3 only animates the transient y/height from the collapsed start. Runs
  // in a layout effect so the collapsed start is set before paint (no flash
  // of full-height bars). Fires on mount and re-animates whenever the
  // derived `bars`/`baseline` change (i.e. on `data`, `tickCount`, or
  // `height` changes).
  const barsRef = useRef<SVGGElement | null>(null);
  useLayoutEffect(() => {
    const g = barsRef.current;
    if (!g) return;
    const rects = select(g).selectAll<SVGRectElement, (typeof bars)[number]>('rect').data(bars);
    if (prefersReducedMotion()) return;
    const dur = motionDurationMs('--oi-motion-duration-default');
    rects
      .attr('y', baseline)
      .attr('height', 0)
      .transition()
      .duration(dur)
      .delay((_d, i) => (bars.length ? (i * dur) / bars.length : 0))
      .ease(easeCubicOut)
      .attr('y', (d) => d.y)
      .attr('height', (d) => d.h);
    return () => {
      rects.interrupt();
    };
  }, [bars, baseline]);

  return (
    <svg
      viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Bar chart"
      className={cx(styles.svg, styles[`color_${color}`], className)}
    >
      {/* Gridlines + Y-axis tick labels */}
      {ticks.map((t) => {
        const y = PAD.top + plotH - (tickMax === 0 ? 0 : (t / tickMax) * plotH);
        return (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={VB_WIDTH - PAD.right}
              y1={y}
              y2={y}
              className={styles.gridline}
            />
            <text x={PAD.left - 6} y={y + 3} className={styles.tick} textAnchor="end">
              {formatTick(t)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      <g ref={barsRef}>
        {bars.map((b) => (
          <Tooltip key={b.label} label={`${b.label}: ${b.value}`}>
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx="2"
              tabIndex={0}
              className={styles.bar}
            />
          </Tooltip>
        ))}
      </g>

      {/* X-axis labels */}
      {bars.map((b) => (
        <text
          key={`l-${b.label}`}
          x={b.x + b.w / 2}
          y={VB_HEIGHT - 10}
          textAnchor="middle"
          className={styles.axisLabel}
        >
          {b.label}
        </text>
      ))}
    </svg>
  );
}

/* ---------- helpers ---------- */

function formatTick(n: number): string {
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
}
