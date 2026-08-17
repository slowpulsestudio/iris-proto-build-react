import { type CSSProperties } from 'react';
import { cx } from '../../lib/cx.js';
import { Icon } from '../Icon/Icon.js';
import { BrandLogo } from '../BrandLogo/BrandLogo.js';
import { Menu } from '../Menu/Menu.js';
import { useProductMenuItems } from '../../lib/productMenu.js';
import { useVertical, type VerticalNavEntry } from '../../lib/verticals.js';
import styles from './GlobalSidebar.module.css';

export type SidebarMode = 'pinned' | 'peek';

export interface GlobalSidebarProps {
  open: boolean;
  dragging?: boolean;
  width?: number;
  mode?: SidebarMode;
  activeItem?: string;
  onItemChange?: (value: string) => void;
  /** Mouse enters the panel (peek mode). */
  onPeekStart?: () => void;
  /** Mouse leaves the panel (peek mode). */
  onPeekEnd?: () => void;
  className?: string;
}

type NavEntry = VerticalNavEntry;

/**
 * GlobalSidebar — full-height product-level navigation panel.
 *
 * Two visual modes:
 *   • `pinned` — occupies a flex slot; width animates 0↔216 so the
 *     adjacent content column is pushed/pulled (no layout shift).
 *   • `peek`   — absolutely positioned overlay above the content column,
 *     slides in from the left with a drop shadow. Triggered by hover.
 */
export function GlobalSidebar({
  open,
  dragging = false,
  width = 216,
  mode = 'pinned',
  activeItem = 'directory',
  onItemChange,
  onPeekStart,
  onPeekEnd,
  className,
}: GlobalSidebarProps) {
  const vertical = useVertical();
  const productMenuItems = useProductMenuItems();
  const isPeek = mode === 'peek';
  const widthVars = {
    '--global-sidebar-width': `${width}px`,
  } as CSSProperties & Record<'--global-sidebar-width', string>;

  return (
    <div
      className={cx(
        styles.root,
        isPeek ? styles.rootPeek : styles.rootPinned,
        open && styles.rootOpen,
        dragging && styles.rootDragging,
        className,
      )}
      style={widthVars}
      aria-hidden={!open || undefined}
      onMouseEnter={isPeek ? onPeekStart : undefined}
      onMouseLeave={isPeek ? onPeekEnd : undefined}
    >
      <div className={styles.inner}>
        {/* ── Header (pinned mode only — in peek the AppHeader stays visible) ── */}
        {!isPeek && (
          <div className={styles.header}>
            <span className={styles.logoMark} aria-hidden="true">
              <BrandLogo size="24px" />
            </span>
            <Menu
              ariaLabel="Switch product"
              align="end"
              items={productMenuItems}
              trigger={({ ref, onClick, expanded }) => (
                <button
                  ref={ref as React.Ref<HTMLButtonElement>}
                  type="button"
                  onClick={onClick}
                  aria-haspopup="menu"
                  aria-expanded={expanded}
                  aria-label="Switch product"
                  className={styles.productBtn}
                >
                  <span className={styles.productLabel}>{vertical.label}</span>
                  <Icon name="CaretDown" size="12px" />
                </button>
              )}
            />
          </div>
        )}

        {/* ── Navigation ────────────────────────── */}
        <nav className={styles.nav} aria-label="Global navigation">
          <ul className={styles.group} role="list">
            {vertical.mainNav.map((item) => (
              <li key={item.value}>
                <NavItem
                  item={item}
                  active={item.value === activeItem}
                  onSelect={() => {
                    if (item.disabled) return;
                    onItemChange?.(item.value);
                  }}
                />
              </li>
            ))}
          </ul>

          <div className={styles.sectionHeader} aria-hidden="true">
            <span className={styles.sectionLabel}>Other</span>
          </div>

          <ul className={styles.group} role="list">
            {vertical.otherNav.map((item) => (
              <li key={item.value}>
                <NavItem
                  item={item}
                  active={item.value === activeItem}
                  onSelect={() => {
                    if (item.disabled) return;
                    onItemChange?.(item.value);
                  }}
                />
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Footer help text ──────────────────── */}
        <div className={styles.footer}>
          <p className={styles.footerHint}>
            <kbd className={styles.footerKbd}>⌘</kbd>
            <kbd className={styles.footerKbd}>B</kbd> to toggle the sidebar
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Internal NavItem                                                   */
/* ------------------------------------------------------------------ */

interface NavItemProps {
  item: NavEntry;
  active: boolean;
  onSelect: () => void;
}

function NavItem({ item, active, onSelect }: NavItemProps) {
  return (
    <button
      type="button"
      className={cx(styles.item, active && styles.itemActive, item.disabled && styles.itemDisabled)}
      onClick={onSelect}
      aria-current={active ? 'page' : undefined}
      aria-disabled={item.disabled || undefined}
      disabled={item.disabled}
      title={item.disabled ? `${item.label} — not available yet` : undefined}
    >
      <span className={styles.itemIconBound} aria-hidden="true">
        <Icon name={item.icon} size="16px" />
      </span>
      <span className={styles.itemLabel}>{item.label}</span>
    </button>
  );
}
