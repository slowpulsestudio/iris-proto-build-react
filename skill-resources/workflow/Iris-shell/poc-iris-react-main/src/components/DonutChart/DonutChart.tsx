import { useLayoutEffect, useMemo, useRef } from 'react';
import { pie, arc, type PieArcDatum } from 'd3-shape';
import { select } from 'd3-selection';
import { interpolate } from 'd3-interpolate';
import { easeCubicOut } from 'd3-ease';
import 'd3-transition';
import { cx } from '../../lib/cx.js';
import { chartSeriesColor } from '../../lib/chartColors.js';
import { motionDurationMs, prefersReducedMotion } from '../../lib/motion.js';
import { Tooltip } from '../Tooltip/Tooltip.js';
import styles from './DonutChart.module.css';

export interface DonutSegment {
  label: string;
  value: number;
}

export interface DonutChartProps {
  segments: DonutSegment[];
  className?: string;
}

/**
 * DonutChart — minimal SVG donut + legend.
 */
export function DonutChart({ segments, className }: DonutChartProps) {
  const VB = 160; // viewBox is square
  const R = 60;
  const STROKE = 22;

  const makeArc = useMemo(
    () =>
      arc<PieArcDatum<DonutSegment>>()
        .innerRadius(R - STROKE / 2)
        .outerRadius(R + STROKE / 2),
    [],
  );

  const { arcs, total } = useMemo<{ arcs: PieArcDatum<DonutSegment>[]; total: number }>(() => {
    const t = segments.reduce((s, x) => s + x.value, 0);
    const layout = pie<DonutSegment>()
      .value((s) => s.value)
      .sort(null)
      .startAngle(0)
      .endAngle(2 * Math.PI);
    return { arcs: layout(segments), total: t };
  }, [segments]);

  // Sweep each arc open from its start angle to its end angle by
  // interpolating `endAngle`. React renders the final paths; d3 only drives
  // the transient `d` during the transition. Layout effect sets the
  // collapsed start before paint to avoid a flash of the full ring. Fires on
  // mount and re-animates whenever the derived `arcs`/`makeArc` change (i.e.
  // on `segments` changes).
  const ringRef = useRef<SVGGElement | null>(null);
  useLayoutEffect(() => {
    const g = ringRef.current;
    if (!g) return;
    const paths = select(g).selectAll<SVGPathElement, PieArcDatum<DonutSegment>>('path').data(arcs);
    if (prefersReducedMotion()) return;
    const dur = motionDurationMs('--oi-motion-duration-default');
    paths
      .attr('d', (d) => makeArc({ ...d, endAngle: d.startAngle }) ?? '')
      .transition()
      .duration(dur)
      .ease(easeCubicOut)
      .attrTween('d', (d) => {
        const i = interpolate(d.startAngle, d.endAngle);
        return (t) => makeArc({ ...d, endAngle: i(t) }) ?? '';
      });
    return () => {
      paths.interrupt();
    };
  }, [arcs, makeArc]);

  return (
    <div className={cx(styles.wrap, className)}>
      <svg viewBox={`0 0 ${VB} ${VB}`} className={styles.svg} role="img" aria-label="Distribution">
        {/* Track */}
        <circle
          cx={VB / 2}
          cy={VB / 2}
          r={R}
          fill="none"
          stroke="var(--oi-border-color-muted)"
          strokeWidth={STROKE}
        />
        {/* Segments — rotated -90deg so 0 starts at top */}
        <g ref={ringRef} transform={`translate(${VB / 2} ${VB / 2}) rotate(-90)`}>
          {arcs.map((a) => (
            <Tooltip key={a.data.label} label={`${a.data.label}: ${formatTotal(a.data.value)}`}>
              <path d={makeArc(a) ?? ''} fill={chartSeriesColor(a.index)} tabIndex={0} />
            </Tooltip>
          ))}
        </g>
        {/* Center label */}
        <text x={VB / 2} y={VB / 2 - 2} textAnchor="middle" className={styles.centerNum}>
          {formatTotal(total)}
        </text>
        <text x={VB / 2} y={VB / 2 + 14} textAnchor="middle" className={styles.centerLbl}>
          Total
        </text>
      </svg>

      <ul className={styles.legend}>
        {segments.map((s, i) => (
          <li key={s.label} className={styles.legendItem} title={s.label}>
            <span
              className={styles.dot}
              style={{ backgroundColor: chartSeriesColor(i) }}
              aria-hidden="true"
            />
            <span className={styles.legendLabel}>{s.label}</span>
            <span className={styles.legendValue}>{formatTotal(s.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatTotal(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}
