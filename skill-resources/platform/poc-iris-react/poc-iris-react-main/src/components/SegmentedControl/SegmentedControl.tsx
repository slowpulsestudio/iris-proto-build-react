import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { cx } from '../../lib/cx.js';
import { prefersReducedMotion } from '../../lib/motion.js';
import { Icon } from '../Icon/Icon.js';
import styles from './SegmentedControl.module.css';

export interface SegmentedItem {
  value: string;
  label: string;
  icon: string;
  /** When true, selecting this segment plays a heart-burst celebration. */
  celebrate?: boolean;
}

interface Particle {
  px: number;
  py: number;
  pdur: number;
  pdelay: number;
  endScale: number;
  psize: number;
}

/** Eight dots flung along a jittered ring so each burst sprays differently. */
function makeParticles(): Particle[] {
  const COUNT = 8;
  return Array.from({ length: COUNT }, (_, i) => {
    const angle = (i / COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
    const dist = 16 + Math.random() * 12;
    return {
      px: Math.cos(angle) * dist,
      py: Math.sin(angle) * dist,
      pdur: 500 + Math.random() * 250,
      pdelay: Math.random() * 60,
      endScale: 0.4 + Math.random() * 0.4,
      psize: 0.7 + Math.random() * 0.9,
    };
  });
}

// Selecting a celebrate segment often navigates, which unmounts this control
// and mounts a fresh one on the destination page — losing local burst state.
// Hand the signal off through a module-level baton so the next mount can play
// the celebration. `at` guards against replaying a stale click.
let pendingCelebration: { value: string; at: number } | null = null;
const CELEBRATION_WINDOW_MS = 1000;

// Remembers the last-active value per control (keyed by ariaLabel) so a
// navigation-triggered remount can slide the pill from where it came from
// instead of snapping. Keyed so distinct segmented controls don't collide.
const lastActiveByGroup = new Map<string, string>();

export interface SegmentedControlProps {
  items: SegmentedItem[];
  /** Currently-selected value. */
  value: string;
  onChange?: (value: string) => void;
  ariaLabel?: string;
  className?: string;
}

/**
 * SegmentedControl — single-select option group rendered as a row of segments.
 *
 * Each segment shows an icon stacked over a label, matching the Iris pattern.
 */
export function SegmentedControl({
  items,
  value,
  onChange,
  ariaLabel = 'View',
  className,
}: SegmentedControlProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pillRef = useRef<HTMLSpanElement | null>(null);
  // Snap (no tween) on first paint and resize; slide only on selection change.
  const didPaintRef = useRef(false);

  // Active heart-burst celebration (value + nonce to restart the animation).
  const [burst, setBurst] = useState<{ value: string; nonce: number; particles: Particle[] } | null>(
    null,
  );
  const burstTimer = useRef<number | null>(null);
  useEffect(() => () => window.clearTimeout(burstTimer.current ?? undefined), []);

  const playBurst = (target: string) => {
    window.clearTimeout(burstTimer.current ?? undefined);
    setBurst({ value: target, nonce: Date.now(), particles: makeParticles() });
    burstTimer.current = window.setTimeout(() => setBurst(null), 900);
  };

  const handleSelect = (item: SegmentedItem) => {
    if (item.celebrate && !prefersReducedMotion()) {
      // Record the intent before onChange so a navigating select still animates
      // once the destination page remounts this control.
      pendingCelebration = { value: item.value, at: Date.now() };
      if (item.value === value) playBurst(item.value); // re-select: no remount coming
    }
    onChange?.(item.value);
  };

  // Claim a pending celebration once the selected celebrate segment is showing —
  // covers both the same-instance value change and a fresh post-navigation mount.
  useEffect(() => {
    if (!pendingCelebration) return;
    const { value: target, at } = pendingCelebration;
    if (target !== value || Date.now() - at > CELEBRATION_WINDOW_MS) return;
    if (!items.some((i) => i.value === value && i.celebrate)) return;
    pendingCelebration = null;
    playBurst(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, items]);

  // Slide the pill under a segment by writing its measured offsetLeft /
  // offsetWidth onto the pill; CSS owns the tween. `target` selects the
  // segment by value; null falls back to the currently-selected one.
  const positionPill = (target: string | null, animate: boolean) => {
    const root = rootRef.current;
    const pill = pillRef.current;
    if (!root || !pill) return;
    const seg = root.querySelector<HTMLElement>(
      target != null
        ? `[role="tab"][data-value="${target}"]`
        : '[role="tab"][aria-selected="true"]',
    );
    if (!seg) return;
    if (animate) {
      pill.style.transform = `translateX(${seg.offsetLeft}px)`;
      pill.style.width = `${seg.offsetWidth}px`;
    } else {
      const prev = pill.style.transition;
      pill.style.transition = 'none';
      pill.style.transform = `translateX(${seg.offsetLeft}px)`;
      pill.style.width = `${seg.offsetWidth}px`;
      void pill.offsetWidth;
      pill.style.transition = prev;
    }
  };

  useLayoutEffect(() => {
    // Switching views navigates and remounts this control, so a normal first
    // paint would snap the fill into place. Slide it from the previously-active
    // segment instead by seeding the pill there, then tweening to the current.
    const prev = lastActiveByGroup.get(ariaLabel);
    const canCrossSlide =
      !didPaintRef.current &&
      prev != null &&
      prev !== value &&
      !prefersReducedMotion() &&
      items.some((i) => i.value === prev);
    if (canCrossSlide) {
      positionPill(prev, false);
      requestAnimationFrame(() => positionPill(value, true));
    } else {
      positionPill(value, didPaintRef.current);
    }
    didPaintRef.current = true;
    lastActiveByGroup.set(ariaLabel, value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, items]);

  useEffect(() => {
    const onResize = () => positionPill(null, false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={rootRef}
      className={cx(styles.root, className)}
      role="tablist"
      aria-label={ariaLabel}
    >
      <span ref={pillRef} aria-hidden="true" className={styles.pill} />
      {items.map((item) => {
        const selected = item.value === value;
        const bursting = item.celebrate === true && burst?.value === item.value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            data-value={item.value}
            aria-selected={selected}
            className={cx(styles.item, selected && styles.selected)}
            onClick={() => handleSelect(item)}
          >
            <span className={styles.iconWrap}>
              <Icon name={item.icon} size="20px" />
              {bursting && (
                <span key={burst.nonce} className={styles.particles} aria-hidden="true">
                  {burst.particles.map((p, i) => (
                    <i
                      key={i}
                      style={
                        {
                          '--px': `${p.px}px`,
                          '--py': `${p.py}px`,
                          '--pdur': `${p.pdur}ms`,
                          '--pdelay': `${p.pdelay}ms`,
                          '--p-end-scale': p.endScale,
                          '--psize': p.psize,
                        } as CSSProperties
                      }
                    />
                  ))}
                </span>
              )}
            </span>
            <span className={styles.label}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
