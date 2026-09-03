import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { cx } from '../../lib/cx.js';
import { navigate } from '../../lib/router.js';
import { useFavorites } from '../../lib/useFavorites.js';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl.js';
import { MultiSelect, type MultiSelectOption } from '../MultiSelect/MultiSelect.js';
import { NavItem } from '../NavItem/NavItem.js';
import { Tooltip } from '../Tooltip/Tooltip.js';
import { Tree } from './Tree.js';
import styles from './Sidebar.module.css';

export interface SidebarNavItem {
  value: string;
  label: string;
  icon: string;
}

export interface SidebarProps {
  navItems: SidebarNavItem[];
  activeNav: string;
  onNavChange?: (value: string) => void;
  directoryLabel: string;
  /** Active directory-view segment (Flat/Tree/Favourites), derived from route. */
  view: string;
  onViewChange: (value: string) => void;
  /** Rail width in px. Falls back to the CSS default when omitted. */
  width?: number;
  /** Active-drag styling for the resize handle. */
  dragging?: boolean;
  /** When provided, renders a drag-to-resize handle on the right edge. */
  onResizePointerDown?: (e: ReactPointerEvent<HTMLButtonElement>) => void;
  className?: string;
}

const VIEW_OPTIONS = [
  { value: 'flat', label: 'Flat view', icon: 'BuildingOffice' },
  { value: 'tree', label: 'Tree view', icon: 'TreeView' },
  { value: 'favourites', label: 'Favourites', icon: 'Heart' },
];

/** Directories available in the directory multi-select. */
const DIRECTORIES: MultiSelectOption[] = [
  {
    value: 'entra-1',
    title: 'Entra 1',
    subtitle: 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890',
    icon: 'WindowsLogo',
  },
  {
    value: 'entra-2',
    title: 'Entra 2',
    subtitle: 'B2C3D4E5-F6A7-8901-BCDE-F23456789012',
    icon: 'WindowsLogo',
  },
  {
    value: 'ad-1',
    title: 'AD-1',
    subtitle: 'C3D4E5F6-A7B8-9012-CDEF-345678901234',
    icon: 'HardDrives',
  },
  {
    value: 'ad-2',
    title: 'AD-2',
    subtitle: 'D4E5F6A7-B8C9-0123-DEF0-456789012345',
    icon: 'HardDrives',
  },
  {
    value: 'entra-3',
    title: 'Entra 3',
    subtitle: 'E5F6A7B8-C9D0-1234-EF01-567890123456',
    icon: 'WindowsLogo',
  },
  {
    value: 'ad-3',
    title: 'AD-3',
    subtitle: 'F6A7B8C9-D0E1-2345-F012-678901234567',
    icon: 'HardDrives',
  },
  {
    value: 'ad-4',
    title: 'AD-4',
    subtitle: 'A7B8C9D0-E1F2-3456-0123-789012345678',
    icon: 'HardDrives',
  },
  {
    value: 'entra-4',
    title: 'Entra 4',
    subtitle: 'B8C9D0E1-F2A3-4567-1234-890123456789',
    icon: 'WindowsLogo',
  },
  {
    value: 'ad-5',
    title: 'AD-5',
    subtitle: 'C9D0E1F2-A3B4-5678-2345-901234567890',
    icon: 'HardDrives',
  },
];

/**
 * Sidebar — directory navigation rail.
 */
export function Sidebar({
  navItems,
  activeNav,
  onNavChange,
  directoryLabel,
  view,
  onViewChange,
  width,
  dragging = false,
  onResizePointerDown,
  className,
}: SidebarProps) {
  const [directories, setDirectories] = useState<Set<string>>(
    () => new Set(DIRECTORIES.map((d) => d.value)),
  );

  // Shared active indicator that slides between nav rows. NavItem's built-in
  // bar is suppressed (hideIndicator) so this single element can animate
  // between positions instead of the per-row bars hard-cutting.
  const navRef = useRef<HTMLElement | null>(null);
  const indicatorRef = useRef<HTMLSpanElement | null>(null);
  const didPaintRef = useRef(false);

  const moveIndicator = (animate: boolean) => {
    const nav = navRef.current;
    const ind = indicatorRef.current;
    if (!nav || !ind) return;
    const active = nav.querySelector<HTMLElement>('[aria-current="page"]');
    if (!active) {
      ind.style.height = '0px';
      return;
    }
    const write = () => {
      ind.style.transform = `translateY(${active.offsetTop}px)`;
      ind.style.height = `${active.offsetHeight}px`;
    };
    if (animate) {
      write();
    } else {
      const prev = ind.style.transition;
      ind.style.transition = 'none';
      write();
      void ind.offsetHeight;
      ind.style.transition = prev;
    }
  };

  useLayoutEffect(() => {
    moveIndicator(didPaintRef.current);
    didPaintRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNav, navItems]);

  useEffect(() => {
    const onResize = () => moveIndicator(false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <aside
      className={cx(styles.sidebar, className)}
      style={width ? ({ '--directory-sidebar-width': `${width}px` } as CSSProperties) : undefined}
      aria-label="Directory"
    >
      {onResizePointerDown &&
        (dragging ? (
          <button
            type="button"
            aria-label="Resize sidebar"
            className={cx(styles.resizeHandle, styles.resizeHandleDragging)}
            onPointerDown={onResizePointerDown}
            onClick={(e) => e.preventDefault()}
          >
            <span className={styles.resizeHandleGrip} aria-hidden="true" />
          </button>
        ) : (
          <Tooltip label="Drag to resize" placement="bottom" delay={150} followCursor>
            <button
              type="button"
              aria-label="Resize sidebar"
              className={styles.resizeHandle}
              onPointerDown={onResizePointerDown}
              onClick={(e) => e.preventDefault()}
            >
              <span className={styles.resizeHandleGrip} aria-hidden="true" />
            </button>
          </Tooltip>
        ))}

      <div className={styles.sidebarSurface}>
        <div className={styles.viewSwitch}>
          <SegmentedControl
            items={VIEW_OPTIONS}
            value={view}
            onChange={onViewChange}
            ariaLabel="Directory view"
          />
        </div>

        {view === 'tree' ? (
          <Tree />
        ) : view === 'favourites' ? (
          <FavouritesBody />
        ) : (
          <>
            <div className={styles.selectBlock}>
              <MultiSelect
                label={directoryLabel}
                ariaLabel="Filter by directory"
                searchPlaceholder="Search directories"
                options={DIRECTORIES}
                selected={directories}
                onSelectionChange={setDirectories}
                className={styles.directorySelect}
              />
            </div>

            <nav ref={navRef} className={styles.nav} aria-label="Directory entities">
              <span ref={indicatorRef} aria-hidden="true" className={styles.navIndicator} />
              {navItems.map((item) => (
                <NavItem
                  key={item.value}
                  icon={item.icon}
                  label={item.label}
                  selected={item.value === activeNav}
                  hideIndicator
                  onClick={() => onNavChange?.(item.value)}
                />
              ))}
            </nav>
          </>
        )}
      </div>
    </aside>
  );
}

/** Favourites segment body — shortcuts to favorited objects. */
function FavouritesBody() {
  const { entries } = useFavorites();

  if (entries.length === 0) {
    return (
      <nav className={styles.nav} aria-label="Favourites">
        <p className={styles.favEmpty}>No favourites yet. Star an object to pin it here.</p>
      </nav>
    );
  }

  return (
    <nav className={styles.nav} aria-label="Favourites">
      {entries.map((f) => (
        <NavItem
          key={f.id}
          icon="Heart"
          label={f.name}
          hideIndicator
          onClick={() => navigate(f.href)}
        />
      ))}
    </nav>
  );
}
