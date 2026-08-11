import { useEffect, useState, type ReactNode } from 'react';
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
   * Hide the textual label and render the action as an icon-only button.
   * The label is preserved as `aria-label` and surfaced visually via a
   * `Tooltip` on hover/focus so the action stays discoverable.
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

  if (!mounted) return null;

  const nonEmptyGroups = groups.filter((g) => g && g.length > 0);

  const bar = (
    <div
      role="toolbar"
      aria-label="Bulk actions"
      className={cx(styles.bar, styles[layout], entered && styles.barOpen, className)}
    >
      <div className={styles.dismiss}>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Clear selection"
          className={styles.dismissBtn}
        >
          <Icon name="X" size="16px" />
        </button>
      </div>

      <p className={styles.count} aria-live="polite">
        <span className={styles.countStrong}>{selectedCount}</span>
        <span className={styles.countMuted}> of </span>
        <span className={styles.countStrong}>{totalCount}</span>
        <span className={styles.countMuted}> {itemNoun}</span>
      </p>

      {nonEmptyGroups.map((group, gi) => (
        <div key={gi} className={styles.group} role="group">
          <span className={styles.separator} aria-hidden="true" />
          {group.map((item, i) => (
            <ActionButton key={`${i}-${item.label}`} {...item} />
          ))}
        </div>
      ))}
    </div>
  );

  // Inline: stay in the document flow but overlay the pagination/table below on
  // a raised z-index instead of pushing it — the wrapper consumes no height.
  if (layout === 'inline') {
    return (
      <div className={styles.inlineWrap}>
        <div className={styles.inlineInner}>{bar}</div>
      </div>
    );
  }

  // Floating: portal a fixed pill above everything at the viewport bottom.
  return createPortal(bar, document.body);
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
