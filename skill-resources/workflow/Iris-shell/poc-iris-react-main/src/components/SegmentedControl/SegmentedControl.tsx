import { useEffect, useLayoutEffect, useRef } from 'react';
import { cx } from '../../lib/cx.js';
import { Icon } from '../Icon/Icon.js';
import styles from './SegmentedControl.module.css';

export interface SegmentedItem {
  value: string;
  label: string;
  icon: string;
}

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

  // Slide the pill behind the selected segment by writing the active button's
  // measured offsetLeft / offsetWidth onto the pill; CSS owns the tween.
  const movePill = (animate: boolean) => {
    const root = rootRef.current;
    const pill = pillRef.current;
    if (!root || !pill) return;
    const active = root.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
    if (!active) return;
    if (animate) {
      pill.style.transform = `translateX(${active.offsetLeft}px)`;
      pill.style.width = `${active.offsetWidth}px`;
    } else {
      const prev = pill.style.transition;
      pill.style.transition = 'none';
      pill.style.transform = `translateX(${active.offsetLeft}px)`;
      pill.style.width = `${active.offsetWidth}px`;
      void pill.offsetWidth;
      pill.style.transition = prev;
    }
  };

  useLayoutEffect(() => {
    movePill(didPaintRef.current);
    didPaintRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, items]);

  useEffect(() => {
    const onResize = () => movePill(false);
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
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={selected}
            className={cx(styles.item, selected && styles.selected)}
            onClick={() => onChange?.(item.value)}
          >
            <Icon name={item.icon} size="20px" />
            <span className={styles.label}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
