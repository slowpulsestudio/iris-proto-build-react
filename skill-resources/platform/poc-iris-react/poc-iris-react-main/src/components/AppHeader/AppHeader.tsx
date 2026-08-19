import { BorderBeam } from 'border-beam';
import { cx } from '../../lib/cx.js';
import { useTheme } from '../../lib/useTheme.js';
import { IconButton } from '../IconButton/IconButton.js';
import { Avatar } from '../Avatar/Avatar.js';
import { Icon } from '../Icon/Icon.js';
import { BrandLogo } from '../BrandLogo/BrandLogo.js';
import { Menu, type MenuEntry } from '../Menu/Menu.js';
import { Tooltip } from '../Tooltip/Tooltip.js';
import { useProductMenuItems } from '../../lib/productMenu.js';
import { SidebarCollapsedIcon, SidebarExpandedIcon } from './SidebarToggleIcons.js';
import styles from './AppHeader.module.css';

export interface CrumbObject {
  label: string;
  onClick?: () => void;
}

export type Crumb = string | CrumbObject;

export interface HeaderUser {
  name: string;
  src?: string;
  /** Optional secondary line shown under the name in the profile menu. */
  email?: string;
}

export interface AppHeaderProps {
  /**
   * Ordered list of crumbs. Each item is either a plain label string or
   * `{ label, onClick }`. Items with `onClick` render as clickable buttons;
   * the last crumb is always rendered as the current page.
   */
  breadcrumb: Crumb[];
  user: HeaderUser;
  /** Called when sidebar toggle is clicked. */
  onToggleSidebar?: () => void;
  /** When true the global sidebar is visible — hides the header logo to avoid duplication. */
  sidebarOpen?: boolean;
  /** Mouse enters the toggle (start peek). */
  onTogglePeekStart?: () => void;
  /** Mouse leaves the toggle (end peek). */
  onTogglePeekEnd?: () => void;
  /** Called when the Ask AI button is clicked. */
  onAskAi?: () => void;
  /** When true the AI side panel is open — suppresses the header button's beam effect. */
  aiActive?: boolean;
  /** Called when the search button is clicked (opens the command palette). */
  onSearch?: () => void;
  className?: string;
}

/**
 * AppHeader — top bar with product chooser, breadcrumb, search/notifications,
 * Ask AI affordance, and user avatar (with a profile menu containing the
 * theme switcher).
 */
export function AppHeader({
  breadcrumb,
  user,
  onToggleSidebar,
  sidebarOpen = false,
  onTogglePeekStart,
  onTogglePeekEnd,
  onAskAi,
  aiActive = false,
  onSearch,
  className,
}: AppHeaderProps) {
  const { theme, setTheme, themes } = useTheme();

  const userMenuItems: MenuEntry[] = [
    {
      kind: 'header',
      visual: <Avatar name={user.name} src={user.src} size="l" />,
      primary: user.name,
      secondary: user.email,
    },
    { kind: 'divider' },
    {
      kind: 'item',
      label: 'Account settings',
      inactive: true,
    },
    { kind: 'divider' },
    { kind: 'section', label: 'Theme' },
    ...themes
      .filter((t) => t.group !== 'more')
      .map(
        (t): MenuEntry => ({
          kind: 'item',
          label: t.label,
          selected: t.value === theme,
          onSelect: () => setTheme(t.value),
        }),
      ),
    {
      kind: 'submenu',
      label: 'More themes',
      icon: 'Palette',
      items: themes
        .filter((t) => t.group === 'more')
        .map(
          (t): MenuEntry => ({
            kind: 'item',
            label: t.label,
            visual: t.swatch ? (
              <span
                aria-hidden
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: t.swatch,
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.25)',
                }}
              />
            ) : undefined,
            selected: t.value === theme,
            onSelect: () => setTheme(t.value),
          }),
        ),
    },
    { kind: 'divider' },
    {
      kind: 'item',
      label: 'Sign out',
      icon: 'SignOut',
      inactive: true,
    },
  ];

  const productMenuItems = useProductMenuItems();

  const lastCrumb = breadcrumb[breadcrumb.length - 1];
  const currentLabel =
    typeof lastCrumb === 'string' ? lastCrumb : lastCrumb?.label ?? '';
  const overflowCrumbItems: MenuEntry[] = breadcrumb.slice(0, -1).map((raw) => {
    const item: CrumbObject = typeof raw === 'string' ? { label: raw } : raw;
    // Keep every entry focusable for keyboard nav. Non-interactive crumbs
    // (no onClick) simply close the menu on select instead of navigating —
    // marking them `inactive` would set aria-disabled and, when all entries
    // are non-interactive, leave the menu with nothing focusable.
    return {
      kind: 'item',
      label: item.label,
      onSelect: item.onClick,
    };
  });

  return (
    <header className={cx(styles.header, className)}>
      <div className={styles.left}>
        {!sidebarOpen && (
          <Menu
            ariaLabel="Switch product"
            align="start"
            topAnchor={44}
            items={productMenuItems}
            trigger={({ ref, onClick, expanded }) => (
              <button
                ref={ref as React.Ref<HTMLButtonElement>}
                type="button"
                onClick={onClick}
                aria-haspopup="menu"
                aria-expanded={expanded}
                aria-label="Switch product"
                className={styles.productChooser}
              >
                <BrandLogo size="24px" />
                <Icon name="CaretDown" size="12px" />
              </button>
            )}
          />
        )}

        <span
          onMouseEnter={onTogglePeekStart}
          onMouseLeave={onTogglePeekEnd}
          className={styles.toggleSlot}
        >
          <IconButton
            icon={sidebarOpen ? <SidebarExpandedIcon /> : <SidebarCollapsedIcon />}
            ariaLabel={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            size="default"
            onClick={onToggleSidebar}
            className={styles.toggleBtn}
          />
        </span>

        <nav
          className={cx(styles.breadcrumb, breadcrumb.length > 1 && styles.breadcrumbCollapsible)}
          aria-label="Breadcrumb"
        >
          {breadcrumb.length > 1 && (
            <div className={styles.crumbsCollapsed}>
              <Menu
                ariaLabel="Breadcrumb trail"
                align="start"
                topAnchor={44}
                items={overflowCrumbItems}
                trigger={({ ref, onClick, expanded }) => (
                  <button
                    ref={ref as React.Ref<HTMLButtonElement>}
                    type="button"
                    onClick={onClick}
                    aria-haspopup="menu"
                    aria-expanded={expanded}
                    aria-label="Show breadcrumb trail"
                    className={styles.crumbOverflow}
                  >
                    <Icon name="DotsThree" size="16px" />
                  </button>
                )}
              />
              <span className={styles.separator} aria-hidden="true">
                /
              </span>
              <span
                aria-current="page"
                className={cx(styles.crumbLabel, styles.crumbCurrent, styles.crumbTruncate)}
                title={currentLabel}
              >
                {currentLabel}
              </span>
            </div>
          )}
          <ol className={styles.crumbs}>
            {breadcrumb.map((raw, i) => {
              const item: CrumbObject = typeof raw === 'string' ? { label: raw } : raw;
              const last = i === breadcrumb.length - 1;
              const interactive = !last && typeof item.onClick === 'function';
              return (
                <li key={`${i}-${item.label}`} className={styles.crumb}>
                  {interactive ? (
                    <button
                      type="button"
                      onClick={item.onClick}
                      className={cx(styles.crumbLabel, styles.crumbLink)}
                    >
                      {item.label}
                    </button>
                  ) : (
                    <span
                      aria-current={last ? 'page' : undefined}
                      className={cx(styles.crumbLabel, last && styles.crumbCurrent)}
                    >
                      {item.label}
                    </span>
                  )}
                  {!last && (
                    <span className={styles.separator} aria-hidden="true">
                      /
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <div className={styles.right}>
        <Tooltip label="Search" shortcut={['⌘', 'K']}>
          <IconButton icon="MagnifyingGlass" ariaLabel="Search" onClick={onSearch} />
        </Tooltip>
        <IconButton icon="Bell" ariaLabel="Notifications" className={styles.bell} />
        <Tooltip label="Ask AI" shortcut={['⌘', '/']}>
          <BorderBeam size="sm" theme="auto" active={!aiActive}>
            <button
              type="button"
              className={styles.askAi}
              onClick={onAskAi}
              aria-label="Ask AI"
            >
              <span className={styles.askAiIcon} aria-hidden="true">
                <Icon name="Sparkle" size="16px" />
              </span>
              <span className={styles.askAiLabel}>Ask AI</span>
            </button>
          </BorderBeam>
        </Tooltip>

        <Menu
          ariaLabel="User menu"
          align="end"
          rightAnchor={9}
          items={userMenuItems}
          trigger={({ ref, onClick, expanded }) => (
            <button
              ref={ref as React.Ref<HTMLButtonElement>}
              type="button"
              onClick={onClick}
              aria-haspopup="menu"
              aria-expanded={expanded}
              aria-label={`Open user menu for ${user.name}`}
              className={styles.userTrigger}
            >
              <Avatar name={user.name} src={user.src} size="default" />
            </button>
          )}
        />
      </div>
    </header>
  );
}
