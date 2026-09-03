import { type CSSProperties, useState } from 'react';
import { cx } from '../../lib/cx.js';
import { Icon } from '../Icon/Icon.js';
import { BrandLogo } from '../BrandLogo/BrandLogo.js';
import { Menu } from '../Menu/Menu.js';
import { useProductMenuItems } from '../../lib/productMenu.js';
import { useVertical, type VerticalNavEntry, type VerticalNavGroup } from '../../lib/verticals.js';
import { useSidebarGroups } from '../../lib/useSidebarGroups.js';
import styles from './GlobalSidebar.module.css';

export type SidebarMode = 'pinned' | 'peek';

export interface GlobalSidebarProps {
  open: boolean;
  dragging?: boolean;
  width?: number;
  mode?: SidebarMode;
  activeItem?: string;
  /**
   * Collapsible nav groups. When provided, they render below the flat
   * `mainNav` items instead of the vertical's `otherNav` section. The caller
   * (AppShell) supplies them already filtered (e.g. by role).
   */
  navGroups?: VerticalNavGroup[];
  onItemChange?: (value: string) => void;
  /** Mouse enters the panel (peek mode). */
  onPeekStart?: () => void;
  /** Mouse leaves the panel (peek mode). */
  onPeekEnd?: () => void;
  className?: string;
}

type NavEntry = VerticalNavEntry;

/** True when an entry is the active one (matches by route first, then value). */
function isEntryActive(item: NavEntry, activeItem: string): boolean {
  return (item.route ?? item.value) === activeItem;
}

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
  navGroups,
  onItemChange,
  onPeekStart,
  onPeekEnd,
  className,
}: GlobalSidebarProps) {
  const vertical = useVertical();
  const productMenuItems = useProductMenuItems();
  const groupState = useSidebarGroups(vertical.id);
  const isPeek = mode === 'peek';
  const widthVars = {
    '--global-sidebar-width': `${width}px`,
  } as CSSProperties & Record<'--global-sidebar-width', string>;

  const grouped = navGroups && navGroups.length > 0;
  // Group holding the active item.
  const activeGroupId = grouped
    ? navGroups!.find((g) => g.items.some((i) => isEntryActive(i, activeItem)))?.id
    : undefined;

  // The active group auto-expands so the current page is visible, until the
  // user manually toggles it — after which their choice wins (they can
  // collapse it). Reset per mount (each navigation remounts the shell).
  const [overriddenGroups, setOverriddenGroups] = useState<Set<string>>(() => new Set());
  const toggleGroup = (id: string) => {
    setOverriddenGroups((prev) => new Set(prev).add(id));
    groupState.toggle(id);
  };

  const handleSelect = (item: NavEntry) => {
    if (item.disabled) return;
    onItemChange?.(item.route ?? item.value);
  };

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
                  active={isEntryActive(item, activeItem)}
                  onSelect={() => handleSelect(item)}
                />
              </li>
            ))}
          </ul>

          {grouped && (
            <>
              {navGroups!.map((group, index) => {
                const collapsed = groupState.isCollapsed(group.id);
                // Active group starts open unless the user has toggled it.
                const expanded = overriddenGroups.has(group.id)
                  ? !collapsed
                  : !collapsed || group.id === activeGroupId;
                const listId = `global-nav-group-${group.id}`;
                const lastIndex = group.items.length - 1;
                // Category caption renders when the section changes.
                const showSection = group.section && group.section !== navGroups![index - 1]?.section;
                return (
                  <div key={group.id} className={styles.navGroup}>
                    {showSection && (
                      <div className={styles.sectionHeader} aria-hidden="true">
                        <span className={styles.sectionLabel}>{group.section}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      className={cx(styles.item, styles.groupHeader)}
                      aria-expanded={expanded}
                      aria-controls={listId}
                      onClick={() => toggleGroup(group.id)}
                    >
                      <span className={styles.itemIconBound} aria-hidden="true">
                        {group.icon && <Icon name={group.icon} size="16px" />}
                      </span>
                      <span className={styles.itemLabel}>{group.label}</span>
                      <Icon
                        name="CaretDown"
                        size="12px"
                        className={cx(styles.groupCaret, expanded && styles.groupCaretOpen)}
                      />
                    </button>
                    {expanded && (
                      <ul id={listId} className={styles.treeList} role="list">
                        {group.items.map((item, i) => {
                          const active = isEntryActive(item, activeItem);
                          return (
                            <li
                              key={item.value}
                              className={cx(styles.treeItem, i === lastIndex && styles.treeItemLast)}
                            >
                              <button
                                type="button"
                                className={cx(styles.item, styles.treeLink, active && styles.treeLinkActive)}
                                onClick={() => handleSelect(item)}
                                aria-current={active ? 'page' : undefined}
                              >
                                <span className={styles.itemIconBound} aria-hidden="true" />
                                <span className={styles.itemLabel}>{item.label}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {vertical.otherNav.length > 0 && (
            <>
              <div className={styles.sectionHeader} aria-hidden="true">
                <span className={styles.sectionLabel}>Other</span>
              </div>
              <ul className={styles.group} role="list">
                {vertical.otherNav.map((item) => (
                  <li key={item.value}>
                    <NavItem
                      item={item}
                      active={isEntryActive(item, activeItem)}
                      onSelect={() => handleSelect(item)}
                    />
                  </li>
                ))}
              </ul>
            </>
          )}
        </nav>
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
