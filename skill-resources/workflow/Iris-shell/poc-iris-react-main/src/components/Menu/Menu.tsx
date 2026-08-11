import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
  type Ref,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../lib/cx.js';
import { Icon } from '../Icon/Icon.js';
import styles from './Menu.module.css';

const SECTION_KIND = 'section';
const ITEM_KIND = 'item';
const HEADER_KIND = 'header';
const SUBMENU_KIND = 'submenu';

export interface MenuItemEntry {
  kind: 'item';
  label: string;
  /** Named icon from the shared manifest (uses `currentColor`). */
  icon?: string;
  /**
   * Custom leading visual (e.g. a product SVG, colored swatch). Takes
   * precedence over `icon`. Pass `null` to reserve the icon-slot's bounding
   * box without rendering anything inside it (useful for keeping labels
   * aligned while artwork is pending).
   */
  visual?: ReactNode;
  selected?: boolean;
  onSelect?: () => void;
  /** Truly disabled — greyed text + `not-allowed` cursor + non-clickable. */
  disabled?: boolean;
  /**
   * Cosmetically inactive — shows `not-allowed` cursor and ignores clicks,
   * but keeps the normal label color. Useful for "coming soon" entries that
   * should still read as branded names, not greyed-out failures.
   */
  inactive?: boolean;
  /** Render the label + icon in the danger colour (e.g. "Delete"). */
  danger?: boolean;
}

export interface MenuSectionEntry {
  kind: 'section';
  label: string;
}

export interface MenuDividerEntry {
  kind: 'divider';
}

/**
 * Rich identity/context block at the top of a menu — e.g. avatar + name +
 * email in a user menu. Non-interactive; not focusable via roving nav.
 */
export interface MenuHeaderEntry {
  kind: 'header';
  /** Anything: an <Avatar />, an <Icon />, a colored dot, etc. */
  visual?: ReactNode;
  primary: string;
  secondary?: string;
}

/**
 * A nested submenu that opens as a flyout to the right of its row on hover,
 * click, or ArrowRight. Its `items` are themselves `MenuEntry`s.
 */
export interface MenuSubmenuEntry {
  kind: 'submenu';
  label: string;
  icon?: string;
  items: MenuEntry[];
}

export type MenuEntry =
  | MenuItemEntry
  | MenuSubmenuEntry
  | MenuSectionEntry
  | MenuDividerEntry
  | MenuHeaderEntry;

export interface MenuTriggerArgs {
  ref: Ref<HTMLElement>;
  onClick: () => void;
  expanded: boolean;
}

export interface MenuProps {
  /** Optional in controlled/context-menu mode (no anchor element). */
  trigger?: (args: MenuTriggerArgs) => ReactNode;
  items: MenuEntry[];
  align?: 'start' | 'end';
  ariaLabel?: string;
  /**
   * Controlled open state. When provided, the menu ignores its internal
   * toggle and reports changes via `onOpenChange` (used for context menus).
   */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Absolute viewport coordinates to anchor the menu at (e.g. the pointer
   * position from a right-click). Takes precedence over trigger anchoring.
   * The menu is clamped to stay within the viewport.
   */
  position?: { x: number; y: number };
  /**
   * Override the menu's vertical anchor (in viewport pixels from the top).
   * When omitted, the menu drops directly under the trigger. Use this when
   * several menus must align to a shared horizontal line (e.g. the bottom
   * edge of the app header) regardless of where each trigger actually sits.
   */
  topAnchor?: number;
  /**
   * When `align="end"`, override the menu's right inset (viewport pixels from
   * the right edge). When omitted, the menu's right edge aligns to the
   * trigger's right edge.
   */
  rightAnchor?: number;
}

interface MenuPos {
  top: number;
  left: number;
  right?: number;
  align: 'start' | 'end';
}

/**
 * Resolve a trigger-anchored menu's `top`: drop below the trigger, but flip
 * above it when there isn't room below yet there is above. Needs the menu's
 * measured height, so the menu must already be mounted when this is used.
 */
function resolveTriggerTop(rect: DOMRect, menuHeight: number): number {
  const margin = 4;
  const below = rect.bottom + 4;
  const overflowsBelow = below + menuHeight > window.innerHeight - margin;
  const fitsAbove = rect.top - 4 - menuHeight >= margin;
  return overflowsBelow && fitsAbove ? rect.top - menuHeight - 4 : below;
}

/**
 * Menu — accessible popover menu anchored to a trigger element.
 *
 * Items support:
 *   - { kind: 'item', label, icon?, selected?, onSelect, disabled? }
 *   - { kind: 'section', label }
 *   - { kind: 'divider' }
 */
export function Menu({
  trigger,
  items,
  align = 'end',
  ariaLabel = 'Menu',
  open: openProp,
  onOpenChange,
  position,
  topAnchor,
  rightAnchor,
}: MenuProps) {
  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? openProp : internalOpen;
  const [pos, setPos] = useState<MenuPos | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const setOpen = useCallback(
    (v: boolean) => {
      if (isControlled) onOpenChange?.(v);
      else setInternalOpen(v);
    },
    [isControlled, onOpenChange],
  );

  const close = useCallback(() => setOpen(false), [setOpen]);

  const toggle = useCallback(() => setOpen(!open), [setOpen, open]);

  // Position the floating menu. In `position` mode it anchors at the pointer
  // coordinates; otherwise it drops below the trigger. Recompute on
  // scroll/resize so a trigger-anchored menu tracks its trigger.
  useEffect(() => {
    if (!open) return;
    if (!position && !triggerRef.current) return;
    const compute = () => {
      if (position) {
        setPos({ top: position.y, left: position.x, align: 'start' });
        return;
      }
      const t = triggerRef.current;
      if (!t) return;
      const rect = t.getBoundingClientRect();
      // Once the menu is mounted+measured, decide the flip here so a scroll/
      // resize computes the final top in one pass — avoiding a below→above
      // correction (and extra render) from the auto-flip layout effect below.
      const measured = menuRef.current;
      const top =
        topAnchor != null
          ? topAnchor
          : measured
            ? resolveTriggerTop(rect, measured.offsetHeight)
            : rect.bottom + 4;
      setPos({
        top,
        left: align === 'end' ? rect.right : rect.left,
        right: align === 'end' && rightAnchor != null ? rightAnchor : undefined,
        align,
      });
    };
    compute();
    // Capture-phase scroll catches scrolling in any ancestor container.
    // `passive: true` keeps the listener out of the scroll-block path.
    const scrollOpts: AddEventListenerOptions = { capture: true, passive: true };
    window.addEventListener('scroll', compute, scrollOpts);
    window.addEventListener('resize', compute);
    return () => {
      window.removeEventListener('scroll', compute, scrollOpts);
      window.removeEventListener('resize', compute);
    };
  }, [open, align, topAnchor, rightAnchor, position]);

  // In pointer-anchored mode, clamp to the viewport once the menu has
  // measured, so a right-click near an edge doesn't overflow off-screen.
  useLayoutEffect(() => {
    if (!open || !position || !menuRef.current) return;
    const el = menuRef.current;
    const mw = el.offsetWidth;
    const mh = el.offsetHeight;
    const margin = 4;
    let left = position.x;
    let top = position.y;
    if (left + mw > window.innerWidth - margin)
      left = Math.max(margin, window.innerWidth - mw - margin);
    if (top + mh > window.innerHeight - margin)
      top = Math.max(margin, window.innerHeight - mh - margin);
    setPos((p) => (p && (p.left !== left || p.top !== top) ? { ...p, left, top } : p));
  }, [open, position]);

  // Trigger-anchored auto-flip, initial-mount corrector: `compute()` can't
  // measure the menu until it's mounted, so on first open it positions below
  // the trigger. Once mounted, flip above if needed. On subsequent scroll/
  // resize `compute()` already produces the final top, so this becomes a
  // no-op (guarded by the `p.top !== top` check). Skipped in pointer mode
  // (clamped above) and when the caller pins a `topAnchor`.
  useLayoutEffect(() => {
    if (!open || position || topAnchor != null) return;
    const el = menuRef.current;
    const t = triggerRef.current;
    if (!el || !t) return;
    const top = resolveTriggerTop(t.getBoundingClientRect(), el.offsetHeight);
    setPos((p) => (p && p.top !== top ? { ...p, top } : p));
  }, [open, position, topAnchor, pos]);

  // Click outside + Escape to dismiss. `[data-oi-menu]` covers the menu and
  // any portaled submenu flyouts so clicks inside them don't dismiss.
  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (
        target?.closest?.('[data-oi-menu]') ||
        (target && triggerRef.current?.contains(target))
      )
        return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDocDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  // Move focus into the menu once it's actually mounted so the whole menu is
  // keyboard-operable (Arrow/Home/End nav + Enter to select). The menu only
  // renders after `pos` is computed — a render *after* `open` flips true — so
  // this must also depend on `pos`; a one-shot ref prevents re-focusing the
  // first item on every scroll/resize reposition while the menu stays open.
  const hasAutoFocused = useRef(false);
  useEffect(() => {
    if (!open) {
      hasAutoFocused.current = false;
      return;
    }
    if (hasAutoFocused.current || !menuRef.current) return;
    const first = menuRef.current.querySelector<HTMLElement>(
      '[role="menuitemradio"]:not([disabled]):not([aria-disabled="true"]), [role="menuitem"]:not([disabled]):not([aria-disabled="true"])',
    );
    if (first) {
      first.focus();
      hasAutoFocused.current = true;
    }
  }, [open, pos]);

  return (
    <>
      {trigger?.({ ref: triggerRef, onClick: toggle, expanded: !!open })}
      {open && pos &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label={ariaLabel}
            data-oi-menu=""
            data-align={pos.align}
            className={styles.menu}
            style={{
              top: pos.top,
              ...(pos.align === 'end'
                ? { right: pos.right != null ? pos.right : window.innerWidth - pos.left }
                : { left: pos.left }),
            }}
            onKeyDown={(e) => handleArrowNav(e, menuRef)}
          >
            {items.map((item, i) => renderItem(item, i, close))}
          </div>,
          document.body,
        )}
    </>
  );
}

function SubmenuItem({ item, close }: { item: MenuSubmenuEntry; close: () => void }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const rowRef = useRef<HTMLButtonElement | null>(null);
  const subRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };
  const openSub = () => {
    cancelClose();
    const r = rowRef.current?.getBoundingClientRect();
    if (r) setPos({ top: r.top, left: r.right });
    setOpen(true);
  };

  // Once the flyout has measured, keep it on-screen: flip to the left of the
  // row if it would overflow the right edge, and clamp vertically. Mirrors
  // the pointer-anchored menu's clamping.
  useLayoutEffect(() => {
    if (!open || !subRef.current || !rowRef.current) return;
    const sub = subRef.current;
    const r = rowRef.current.getBoundingClientRect();
    const sw = sub.offsetWidth;
    const sh = sub.offsetHeight;
    const margin = 4;
    let left = r.right;
    if (left + sw > window.innerWidth - margin) {
      // Flip to the left of the row; clamp if it still doesn't fit.
      left = Math.max(margin, r.left - sw);
    }
    let top = r.top;
    if (top + sh > window.innerHeight - margin) {
      top = Math.max(margin, window.innerHeight - sh - margin);
    }
    setPos((p) => (p && (p.left !== left || p.top !== top) ? { top, left } : p));
  }, [open]);

  useEffect(() => () => cancelClose(), []);

  return (
    <>
      <button
        ref={rowRef}
        type="button"
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={open}
        className={styles.item}
        onMouseEnter={openSub}
        onMouseLeave={scheduleClose}
        onClick={openSub}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openSub();
            requestAnimationFrame(() => {
              subRef.current
                ?.querySelector<HTMLElement>('[role="menuitem"], [role="menuitemradio"]')
                ?.focus();
            });
          } else if (e.key === 'ArrowLeft') {
            setOpen(false);
            rowRef.current?.focus();
          }
        }}
      >
        {item.icon && (
          <span className={styles.itemIcon}>
            <Icon name={item.icon} size="16px" />
          </span>
        )}
        <span className={styles.itemLabel}>{item.label}</span>
        <span className={styles.submenuCaret} aria-hidden="true">
          <Icon name="CaretRight" size="16px" />
        </span>
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={subRef}
            role="menu"
            data-oi-menu=""
            className={styles.menu}
            style={{ top: pos.top, left: pos.left }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft' || e.key === 'Escape') {
                e.stopPropagation();
                setOpen(false);
                rowRef.current?.focus();
                return;
              }
              handleArrowNav(e, subRef);
            }}
          >
            {item.items.map((it, i) => renderItem(it, i, close))}
          </div>,
          document.body,
        )}
    </>
  );
}

function renderItem(item: MenuEntry, i: number, close: () => void): ReactNode {
  if (item.kind === 'divider') {
    return <div key={`d-${i}`} className={styles.divider} role="separator" />;
  }
  if (item.kind === SUBMENU_KIND) {
    return <SubmenuItem key={`sub-${i}-${item.label}`} item={item} close={close} />;
  }
  if (item.kind === HEADER_KIND) {
    return (
      <div key={`h-${i}`} className={styles.header} role="presentation">
        {item.visual && <span className={styles.headerVisual}>{item.visual}</span>}
        <span className={styles.headerText}>
          <span className={styles.headerPrimary}>{item.primary}</span>
          {item.secondary && (
            <span className={styles.headerSecondary}>{item.secondary}</span>
          )}
        </span>
      </div>
    );
  }
  if (item.kind === SECTION_KIND) {
    return (
      <div key={`s-${i}`} className={styles.section} role="presentation">
        {item.label}
      </div>
    );
  }
  if (item.kind === ITEM_KIND) {
    const isRadio = typeof item.selected === 'boolean';
    const inactive = !!item.inactive && !item.disabled;
    return (
      <button
        key={`i-${i}-${item.label}`}
        type="button"
        role={isRadio ? 'menuitemradio' : 'menuitem'}
        aria-checked={isRadio ? item.selected : undefined}
        aria-disabled={inactive || undefined}
        disabled={item.disabled}
        className={cx(
          styles.item,
          item.selected && styles.itemSelected,
          inactive && styles.itemInactive,
          item.danger && styles.itemDanger,
        )}
        onClick={() => {
          if (item.disabled || inactive) return;
          item.onSelect?.();
          close();
        }}
      >
        {(item.visual !== undefined || item.icon) && (
          <span className={styles.itemIcon}>
            {item.visual !== undefined
              ? item.visual
              : item.icon && <Icon name={item.icon} size="16px" />}
          </span>
        )}
        <span className={styles.itemLabel}>{item.label}</span>
        {item.selected && (
          <span className={styles.itemCheck} aria-hidden="true">
            <Icon name="Check" size="16px" />
          </span>
        )}
      </button>
    );
  }
  return null;
}

/** Roving focus between menu items via Up/Down/Home/End. */
function handleArrowNav(
  e: React.KeyboardEvent<HTMLDivElement>,
  menuRef: React.MutableRefObject<HTMLDivElement | null>,
): void {
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
  e.preventDefault();
  if (!menuRef.current) return;
  const items = Array.from(
    menuRef.current.querySelectorAll<HTMLElement>(
      '[role="menuitem"]:not([disabled]):not([aria-disabled="true"]), [role="menuitemradio"]:not([disabled]):not([aria-disabled="true"])',
    ),
  );
  if (!items.length) return;
  const i = items.indexOf(document.activeElement as HTMLElement);
  let next = 0;
  if (e.key === 'ArrowDown') next = i < 0 ? 0 : (i + 1) % items.length;
  else if (e.key === 'ArrowUp') next = i <= 0 ? items.length - 1 : i - 1;
  else if (e.key === 'Home') next = 0;
  else if (e.key === 'End') next = items.length - 1;
  items[next].focus();
}
