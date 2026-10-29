import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { BorderBeam } from 'border-beam';
import { cx } from '../../lib/cx.js';
import { Icon } from '../Icon/Icon.js';
import { Tooltip } from '../Tooltip/Tooltip.js';
import styles from './ActionBar.module.css';

export type ActionTone = 'default' | 'brand' | 'danger';

export interface ActionItem {
  icon: string;
  label: string;
  tone?: ActionTone;
  onClick?: () => void;
  disabled?: boolean;
  /**
   * Force the icon-only rendering (label hidden, preserved as `aria-label` and
   * surfaced via a `Tooltip`). Leave `undefined` to let the bar decide
   * responsively — it collapses every action to icon-only when the fully
   * labeled layout no longer fits its container. Pass an explicit `false` to
   * opt a signature action (e.g. Ask AI) out of that auto-collapse so it always
   * keeps its label.
   */
  iconOnly?: boolean;
  /**
   * Reveal an animated border-beam around the button while it is hovered or
   * focused. Used to give a signature affordance (e.g. Ask AI) extra emphasis.
   */
  beam?: boolean;
}

export interface ActionBarProps {
  /** Show / hide the bar. */
  open: boolean;
  /** Number of currently selected rows. */
  selectedCount: number;
  /** Total rows in the collection. */
  totalCount: number;
  /** Called when the user closes the bar. */
  onDismiss?: () => void;
  /** Action groups; separated by a vertical divider in the bar. */
  groups: ActionItem[][];
  /** Trailing word in the count string. */
  itemNoun?: string;
  /**
   * Placement mode. `floating` (default) portals a fixed pill to the bottom
   * of the viewport, overlaying whatever sits below. `inline` renders the bar
   * in the normal document flow but overlays the pagination footer below it on
   * a raised z-index (fading in) without reflowing or pushing sibling content.
   */
  layout?: 'floating' | 'inline';
  className?: string;
}

/**
 * ActionBar — fixed bottom-centered floating toolbar that appears while a
 * selection is active. Always renders on the constant dark surface so it
 * reads clearly against any theme.
 */
export function ActionBar({
  open,
  selectedCount,
  totalCount,
  onDismiss,
  groups,
  itemNoun = 'selected',
  layout = 'floating',
  className,
}: ActionBarProps) {
  // Mount/unmount with a small exit animation window so the slide-out can play.
  const [mounted, setMounted] = useState(open);
  // Drives the open transition. Always starts `false` (even when `open` is
  // true on first mount) so the bar paints its closed state for one frame
  // before the effect flips it open — that initial→open change is what makes
  // the enter transition (and the inline height push) animate rather than snap.
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (open) {
      setMounted(true);
      // Two frames: first lets the closed state paint, second flips to open.
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setEntered(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
    setEntered(false);
    const t = setTimeout(() => setMounted(false), 180);
    return () => clearTimeout(t);
  }, [open]);

  // Esc dismisses the bar while it's visible.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onDismiss]);

  // Responsive collapse: measure a hidden, always-fully-labeled copy of the bar
  // (`ghostRef`) against the width actually available to it and switch every
  // action to icon-only when the labeled layout would overflow. Measuring an
  // always-labeled ghost — rather than the live bar — means the "natural" width
  // is stable regardless of the current collapsed state, so the decision cannot
  // oscillate at the threshold and stays correct when the action set changes.
  const ghostRef = useRef<HTMLDivElement>(null);
  const availRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  useLayoutEffect(() => {
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ghost = ghostRef.current;
    if (!ghost) return undefined;

    // Breathing room kept on each side of the fixed floating pill.
    const FLOATING_MARGIN = 24;

    const measure = () => {
      const natural = ghost.scrollWidth;
      if (!natural) return;
      const available =
        layout === 'inline'
          ? (availRef.current?.clientWidth ?? 0)
          : window.innerWidth - FLOATING_MARGIN * 2;
      // Not laid out yet (0) — keep the current state rather than flip blindly.
      if (available <= 0) return;
      setCollapsed(natural > available);
    };

    measure();
    const ro = new ResizeObserver(measure);
    // Observe the ghost so an action-set change re-measures, and the available
    // region (inline: the centering wrapper; floating: the viewport).
    ro.observe(ghost);
    if (layout === 'inline') {
      if (availRef.current) ro.observe(availRef.current);
    } else {
      ro.observe(document.documentElement);
    }
    return () => ro.disconnect();
  }, [layout, mounted]);

  if (!mounted) return null;

  const nonEmptyGroups = groups.filter((g) => g && g.length > 0);

  // Renders the bar. `measure` produces the hidden ghost: all labels forced on,
  // beam/tooltip skipped, and removed from the a11y tree so its duplicate
  // count/actions are neither announced nor focusable.
  const renderBar = (measure: boolean) => (
    <div
      ref={measure ? ghostRef : undefined}
      role={measure ? undefined : 'toolbar'}
      aria-label={measure ? undefined : 'Bulk actions'}
      aria-hidden={measure || undefined}
      className={cx(
        styles.bar,
        measure ? styles.ghost : styles[layout],
        !measure && entered && styles.barOpen,
        !measure && className,
      )}
    >
      <div className={styles.dismiss}>
        <button
          type="button"
          onClick={measure ? undefined : onDismiss}
          aria-label="Clear selection"
          tabIndex={measure ? -1 : undefined}
          className={styles.dismissBtn}
        >
          <Icon name="X" size="16px" />
        </button>
      </div>

      <p className={styles.count} aria-live={measure ? undefined : 'polite'}>
        <span className={styles.countStrong}>{selectedCount}</span>
        <span className={styles.countMuted}> of </span>
        <span className={styles.countStrong}>{totalCount}</span>
        <span className={styles.countMuted}> {itemNoun}</span>
      </p>

      {nonEmptyGroups.map((group, gi) => (
        <div key={gi} className={styles.group} role="group">
          <span className={styles.separator} aria-hidden="true" />
          {group.map((item) => (
            <ActionButton
              key={item.label}
              {...item}
              iconOnly={measure ? false : (item.iconOnly ?? collapsed)}
              beam={measure ? false : item.beam}
            />
          ))}
        </div>
      ))}
    </div>
  );

  const bar = renderBar(false);
  const ghost = renderBar(true);

  // Inline: stay in the document flow but overlay the pagination/table below on
  // a raised z-index instead of pushing it — the wrapper consumes no height.
  if (layout === 'inline') {
    return (
      <div className={styles.inlineWrap}>
        <div className={styles.inlineInner} ref={availRef}>
          {bar}
          {ghost}
        </div>
      </div>
    );
  }

  // Floating: portal a fixed pill above everything at the viewport bottom.
  return createPortal(
    <>
      {bar}
      {ghost}
    </>,
    document.body,
  );
}

function ActionButton({
  icon,
  label,
  tone = 'default',
  onClick,
  disabled,
  iconOnly,
  beam,
}: ActionItem): ReactNode {
  // Border-beam is revealed only while the button is hovered / focused.
  const [beaming, setBeaming] = useState(false);
  const beamHandlers =
    beam && !disabled
      ? {
          onMouseEnter: () => setBeaming(true),
          onMouseLeave: () => setBeaming(false),
          onFocus: () => setBeaming(true),
          onBlur: () => setBeaming(false),
        }
      : undefined;

  const btn = (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cx(styles.actionBtn, styles[`tone_${tone}`], iconOnly && styles.actionBtnIconOnly)}
      aria-label={iconOnly ? label : undefined}
      {...beamHandlers}
    >
      <Icon name={icon} size="16px" />
      {!iconOnly && <span>{label}</span>}
    </button>
  );

  let content: ReactNode = btn;
  if (iconOnly) {
    // Disabled <button> elements swallow pointer + focus events in most
    // browsers (Safari in particular), which means Tooltip's hover/focus
    // handlers never fire and the label stays hidden. Wrap the disabled
    // button in a focusable span so the tooltip still surfaces the action's
    // intent.
    const trigger = disabled ? (
      <span className={styles.tooltipShield} tabIndex={0}>
        {btn}
      </span>
    ) : (
      btn
    );
    content = <Tooltip label={label}>{trigger}</Tooltip>;
  }

  if (beam) {
    content = (
      <BorderBeam size="sm" theme="dark" active={beaming} className={styles.beamWrap}>
        {content}
      </BorderBeam>
    );
  }

  return content;
}
