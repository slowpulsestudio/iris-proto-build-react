import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type Ref,
} from 'react';
import { cx } from '../../lib/cx.js';
import { Icon } from '../Icon/Icon.js';
import { Menu, type MenuEntry } from '../Menu/Menu.js';
import styles from './Tabs.module.css';

export interface TabItem {
  value: string;
  label: string;
  icon?: string;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  className?: string;
}

/**
 * Tabs — accessible tabstrip with arrow-key roving focus and a sliding active
 * underline. When the tabs can't all fit, the trailing ones collapse into a
 * "…" overflow menu. Stateless: parent owns the current value.
 */
export function Tabs({ items, value, onChange, ariaLabel, className }: TabsProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLSpanElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const measureTriggerRef = useRef<HTMLSpanElement | null>(null);
  // Snap (no tween) on the first paint and on resize; slide only when the
  // selected value changes in response to interaction.
  const didPaintRef = useRef(false);

  const [visibleCount, setVisibleCount] = useState(items.length);

  const visibleItems = items.slice(0, visibleCount);
  const overflowItems = items.slice(visibleCount);
  const activeInOverflow = overflowItems.some((it) => it.value === value);

  // Decide how many tabs fit; move the rest into the overflow menu. Widths are
  // read from the hidden measurement row so we can size before rendering.
  const recompute = () => {
    const root = rootRef.current;
    const measure = measureRef.current;
    if (!root || !measure) return;
    const available = root.clientWidth;
    const gap = parseFloat(getComputedStyle(measure).columnGap || '0') || 8;
    const tabEls = Array.from(measure.querySelectorAll<HTMLElement>('[data-measure-tab]'));
    const widths = tabEls.map((el) => el.offsetWidth);
    const n = widths.length;

    let total = 0;
    for (let i = 0; i < n; i += 1) total += widths[i] + (i > 0 ? gap : 0);
    if (total <= available) {
      setVisibleCount(n);
      return;
    }

    const triggerW = measureTriggerRef.current?.offsetWidth ?? 32;
    const budget = available - triggerW - gap;
    let acc = 0;
    let k = 0;
    for (let i = 0; i < n; i += 1) {
      const add = widths[i] + (i > 0 ? gap : 0);
      if (acc + add <= budget) {
        acc += add;
        k = i + 1;
      } else break;
    }
    setVisibleCount(Math.max(1, k));
  };

  useLayoutEffect(() => {
    recompute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(() => recompute());
    ro.observe(root);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Slide the active underline to the selected tab; if the active tab is in the
  // overflow menu, underline the "…" trigger instead.
  const moveIndicator = (animate: boolean) => {
    const list = listRef.current;
    const ind = indicatorRef.current;
    if (!list || !ind) return;
    const target =
      list.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]') ||
      list.querySelector<HTMLElement>('[data-overflow-trigger]');
    if (!target) return;
    const write = () => {
      ind.style.transform = `translateX(${target.offsetLeft}px)`;
      ind.style.width = `${target.offsetWidth}px`;
    };
    if (animate) {
      write();
    } else {
      const prev = ind.style.transition;
      ind.style.transition = 'none';
      write();
      // Force a reflow so the snapped position lands before transitions resume.
      void ind.offsetWidth;
      ind.style.transition = prev;
    }
  };

  useLayoutEffect(() => {
    moveIndicator(didPaintRef.current);
    didPaintRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, items, visibleCount]);

  useEffect(() => {
    const onResize = () => moveIndicator(false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const focusByOffset = (currentIdx: number, delta: number) => {
    const list = listRef.current;
    if (!list) return;
    const tabs = list.querySelectorAll<HTMLElement>('[role="tab"]');
    if (tabs.length === 0) return;
    const next = (currentIdx + delta + tabs.length) % tabs.length;
    tabs[next]?.focus();
    onChange(visibleItems[next].value);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        focusByOffset(idx, 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        focusByOffset(idx, -1);
        break;
      case 'Home':
        e.preventDefault();
        focusByOffset(-1, 1);
        break;
      case 'End':
        e.preventDefault();
        focusByOffset(0, -1);
        break;
      default:
    }
  };

  const overflowMenuItems: MenuEntry[] = overflowItems.map((it) => ({
    kind: 'item',
    label: it.label,
    icon: it.icon,
    selected: it.value === value,
    onSelect: () => onChange(it.value),
  }));

  return (
    <div ref={rootRef} className={cx(styles.root, className)}>
      <div ref={listRef} role="tablist" aria-label={ariaLabel} className={styles.tablist}>
        <span ref={indicatorRef} aria-hidden="true" className={styles.indicator} />
        {visibleItems.map((item, i) => {
          const selected = item.value === value;
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={selected}
              // Keep one tab in the tab order; when the active tab is hidden in
              // the overflow menu, make the first visible tab the entry point.
              tabIndex={selected || (activeInOverflow && i === 0) ? 0 : -1}
              onClick={() => onChange(item.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cx(styles.tab, selected && styles.tabSelected)}
            >
              <span className={cx(styles.tabContent, selected && styles.tabContentSelected)}>
                {item.icon && (
                  <span className={styles.icon} aria-hidden="true">
                    <Icon name={item.icon} size="16px" />
                  </span>
                )}
                <span
                  className={cx(styles.label, selected && styles.labelSelected)}
                  data-label={item.label}
                >
                  {item.label}
                </span>
              </span>
              <span
                aria-hidden="true"
                className={cx(styles.stroke, selected && styles.strokeSelected)}
              />
            </button>
          );
        })}

        {overflowItems.length > 0 && (
          <Menu
            ariaLabel="More tabs"
            align="end"
            items={overflowMenuItems}
            trigger={({ ref, onClick, expanded }) => (
              <button
                ref={ref as Ref<HTMLButtonElement>}
                type="button"
                data-overflow-trigger=""
                aria-label="More tabs"
                aria-haspopup="menu"
                aria-expanded={expanded}
                onClick={onClick}
                className={cx(styles.overflowTrigger, activeInOverflow && styles.overflowTriggerActive)}
              >
                <Icon name="DotsThree" size="20px" />
              </button>
            )}
          />
        )}
      </div>

      {/* Hidden measurement row: every tab at natural width + the trigger. */}
      <div ref={measureRef} className={styles.measure} aria-hidden="true">
        {items.map((item) => (
          <span key={item.value} data-measure-tab className={styles.tab}>
            <span className={styles.tabContent}>
              {item.icon && (
                <span className={styles.icon}>
                  <Icon name={item.icon} size="16px" />
                </span>
              )}
              <span className={styles.label} data-label={item.label}>
                {item.label}
              </span>
            </span>
          </span>
        ))}
        <span ref={measureTriggerRef} className={styles.overflowTrigger}>
          <Icon name="DotsThree" size="20px" />
        </span>
      </div>
    </div>
  );
}
