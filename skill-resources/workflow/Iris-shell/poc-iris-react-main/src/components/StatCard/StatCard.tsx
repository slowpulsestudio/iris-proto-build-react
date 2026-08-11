import { useEffect, useMemo, useState } from 'react';
import { cx } from '../../lib/cx.js';
import { Icon } from '../Icon/Icon.js';
import { IconButton } from '../IconButton/IconButton.js';
import styles from './StatCard.module.css';

export type StatCardTrendDirection = 'up' | 'down' | 'warning';
export type StatCardTrendTone = 'success' | 'danger' | 'warning';

export interface StatCardTrend {
  direction: StatCardTrendDirection;
  value: string;
  tone: StatCardTrendTone;
}

export interface StatCardProps {
  label: string;
  value: string;
  trend?: StatCardTrend;
  className?: string;
}

/**
 * StatCard — a single hero metric tile.
 *
 *   <StatCard
 *     label="Managed Users"
 *     value="77,236"
 *     trend={{ direction: 'up', value: '2.4%', tone: 'success' }}
 *   />
 */
export function StatCard({ label, value, trend, className }: StatCardProps) {
  const display = useCountUp(value);
  return (
    <section className={cx(styles.card, className)}>
      <header className={styles.header}>
        <p className={styles.label}>{label}</p>
        <IconButton icon="DotsThree" ariaLabel={`${label} options`} size="s" />
      </header>
      <div className={styles.metric}>
        <p className={styles.value}>{display}</p>
        {trend && (
          <p className={cx(styles.trend, styles[`tone_${trend.tone}`])}>
            <Icon name={TREND_ICONS[trend.direction]} size="16px" />
            <span>{trend.value}</span>
          </p>
        )}
      </div>
    </section>
  );
}

const TREND_ICONS: Record<StatCardTrendDirection, string> = {
  up: 'TrendUp',
  down: 'TrendDown',
  warning: 'Warning',
};

/** Duration of the mount count-up roll. */
const COUNT_UP_MS = 900;

interface ParsedMetric {
  prefix: string;
  suffix: string;
  target: number;
  decimals: number;
  grouped: boolean;
}

/** Split a metric string like "$1,035.00" into its animatable number plus the
 *  non-numeric framing (prefix "$", grouping, decimals) so a count-up can
 *  reformat each frame identically. Returns null when there's no number to
 *  roll (the value is then shown verbatim). */
function parseMetric(value: string): ParsedMetric | null {
  const match = value.match(/[\d,]+(?:\.\d+)?/);
  if (!match || match.index === undefined) return null;
  const numStr = match[0];
  const target = Number(numStr.replace(/,/g, ''));
  if (!Number.isFinite(target)) return null;
  const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;
  return {
    prefix: value.slice(0, match.index),
    suffix: value.slice(match.index + numStr.length),
    target,
    decimals,
    grouped: numStr.includes(','),
  };
}

function formatMetric(n: number, p: ParsedMetric): string {
  const body = n.toLocaleString('en-US', {
    minimumFractionDigits: p.decimals,
    maximumFractionDigits: p.decimals,
    useGrouping: p.grouped,
  });
  return `${p.prefix}${body}${p.suffix}`;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Rolls a metric value up from zero to its target on mount (transitions.dev
 * spinning-counter / number-pop-in, applied as a load-in count). Preserves the
 * original prefix, thousands grouping, and decimals, and snaps to the exact
 * source string at the end to avoid float drift. Honours reduced-motion by
 * showing the final value immediately.
 */
function useCountUp(value: string): string {
  const parsed = useMemo(() => parseMetric(value), [value]);
  const [display, setDisplay] = useState(() =>
    parsed && !prefersReducedMotion() ? formatMetric(0, parsed) : value,
  );

  useEffect(() => {
    if (!parsed || prefersReducedMotion()) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const progress = Math.min((t - start) / COUNT_UP_MS, 1);
      // Ease-out cubic so the roll decelerates into the final value.
      const eased = 1 - Math.pow(1 - progress, 3);
      if (progress < 1) {
        setDisplay(formatMetric(parsed.target * eased, parsed));
        raf = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [parsed, value]);

  return display;
}
