import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { cx } from '../../lib/cx.js';
import { AppHeader, type Crumb, type HeaderUser } from '../../components/AppHeader/AppHeader.js';
import { GlobalSidebar, type SidebarMode } from '../../components/GlobalSidebar/GlobalSidebar.js';
import { Sidebar } from '../../components/Sidebar/Sidebar.js';
import { AiPanel } from '../../components/AiPanel/AiPanel.js';
import { Tooltip } from '../../components/Tooltip/Tooltip.js';
import { navigate, useRoute } from '../../lib/router.js';
import { useSidebarPinned } from '../../lib/useSidebarPinned.js';
import { useAppShell } from '../../lib/appShellContext.js';
import { useVertical } from '../../lib/verticals.js';
import { isTypingTarget } from '../../lib/keyboard.js';
import { CURRENT_USER } from '../../lib/currentUser.js';
import styles from './AppShell.module.css';

/** Map global-nav item value → route hash. Items without a mapping are no-op. */
const GLOBAL_NAV_ROUTES: Record<string, string | undefined> = {
  directory: '#/users',
  insights: '#/insights',
  services: '#/services',
  home: '#/identity',
  instance: '#/safeguard',
};

const SIDEBAR_WIDTH_STORAGE_KEY = 'ars.globalSidebar.width';
const SIDEBAR_WIDTH_DEFAULT = 216;
const SIDEBAR_WIDTH_MIN = 200;
const SIDEBAR_WIDTH_MAX = 330;
const SIDEBAR_COLLAPSE_PULL_THRESHOLD = 36;

function persistSidebarWidth(width: number) {
  try {
    localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(width));
  } catch {
    /* storage unavailable — silently ignore */
  }
}

function clampSidebarWidth(value: number) {
  return Math.min(SIDEBAR_WIDTH_MAX, Math.max(SIDEBAR_WIDTH_MIN, value));
}

function readInitialSidebarWidth(): number {
  try {
    const raw = localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY);
    if (!raw) return SIDEBAR_WIDTH_DEFAULT;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? clampSidebarWidth(parsed) : SIDEBAR_WIDTH_DEFAULT;
  } catch {
    return SIDEBAR_WIDTH_DEFAULT;
  }
}

/** Map secondary (directory) sidebar item value → route hash. */
const SECONDARY_NAV_ROUTES: Record<string, string> = {
  users: '#/users',
  groups: '#/groups',
  devices: '#/devices',
  agents: '#/agents',
  applications: '#/applications',
  'access-templates': '#/access-templates',
  'management-units': '#/management-units',
};

/** Reverse map: route name → secondary sidebar item value (for the highlight). */
const ROUTE_TO_SECONDARY_NAV: Record<string, string> = {
  usersList: 'users',
  userDetail: 'users',
  groups: 'groups',
  devices: 'devices',
  agents: 'agents',
  applications: 'applications',
  accessTemplates: 'access-templates',
  managementUnits: 'management-units',
};

/** Route name → directory view segment (Flat/Tree/Favourites). Entity/WIP
 *  routes are children of Flat; tree/favorites routes map to their segment. */
const ROUTE_TO_VIEW: Record<string, string> = {
  usersList: 'flat',
  userDetail: 'flat',
  groups: 'flat',
  devices: 'flat',
  agents: 'flat',
  applications: 'flat',
  accessTemplates: 'flat',
  managementUnits: 'flat',
  treeRoot: 'tree',
  treeList: 'tree',
  treeDetail: 'tree',
  favoritesList: 'favourites',
};

/** Landing route for each directory view segment. */
const VIEW_ROUTES: Record<string, string> = {
  flat: '#/users',
  tree: '#/tree',
  favourites: '#/favorites',
};

export interface AppShellProps {
  breadcrumb: Crumb[];
  /**
   * Signed-in user shown in the header avatar + user menu. Defaults to
   * {@link CURRENT_USER} so individual pages don't need to repeat it.
   */
  user?: HeaderUser;
  children?: ReactNode;
  /** Which global nav item is current. */
  activeGlobalItem?: string;
  /** Render the directory/sub-nav rail. */
  showSecondarySidebar?: boolean;
  className?: string;
}

/**
 * AppShell — the persistent chrome surrounding every routed view:
 * header bar + left sidebar + a rounded white "main" surface that hosts
 * the view's own content.
 */
export function AppShell({
  breadcrumb,
  user = CURRENT_USER,
  children,
  activeGlobalItem = 'directory',
  showSecondarySidebar = true,
  className,
}: AppShellProps) {
  // Pinned (expanded) state survives navigations + reloads via localStorage.
  // Hover-driven `peek` is transient and stays local.
  // `activeNav` and `aiOpen` are lifted to AppShellContext so they survive
  // page navigations (each page wraps its own AppShell, which would otherwise
  // remount and lose state).
  const { aiOpen, setAiOpen, setSearchOpen } = useAppShell();
  const [pinned, setPinned] = useSidebarPinned();
  const [peeking, setPeeking] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(readInitialSidebarWidth);
  const [sidebarDragging, setSidebarDragging] = useState(false);
  const vertical = useVertical();
  const route = useRoute();
  const secondarySidebar = vertical.secondarySidebar;
  const dragCleanupRef = useRef<(() => void) | null>(null);

  const handleGlobalNavChange = (value: string) => {
    const route = GLOBAL_NAV_ROUTES[value];
    if (route) navigate(route);
  };

  const handleSecondaryNavChange = (value: string) => {
    const target = SECONDARY_NAV_ROUTES[value];
    if (target) navigate(target);
  };

  const handleViewChange = (value: string) => {
    const target = VIEW_ROUTES[value];
    if (target) navigate(target);
  };

  // Debounce closing the peek so quickly moving cursor between the toggle
  // and the sidebar panel doesn't cause the panel to disappear.
  const peekCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // After clicking the toggle, the cursor is still over it — suppress peek
  // until the user actually leaves and re-enters the toggle.
  const suppressPeekUntilLeave = useRef(false);

  const startPeek = () => {
    if (suppressPeekUntilLeave.current) return;
    if (peekCloseTimer.current) {
      clearTimeout(peekCloseTimer.current);
      peekCloseTimer.current = null;
    }
    setPeeking(true);
  };
  const endPeek = () => {
    suppressPeekUntilLeave.current = false;
    if (peekCloseTimer.current) clearTimeout(peekCloseTimer.current);
    peekCloseTimer.current = setTimeout(() => setPeeking(false), 150);
  };
  const handleToggleClick = () => {
    // Cancel any pending peek-close and force-close peek immediately.
    if (peekCloseTimer.current) {
      clearTimeout(peekCloseTimer.current);
      peekCloseTimer.current = null;
    }
    setPeeking(false);
    suppressPeekUntilLeave.current = true;
    setPinned((v) => !v);
  };
  useEffect(
    () => () => {
      if (peekCloseTimer.current) clearTimeout(peekCloseTimer.current);
      dragCleanupRef.current?.();
    },
    [],
  );

  useEffect(() => {
    const onResize = () => {
      setSidebarWidth((prev) => {
        const next = clampSidebarWidth(prev);
        if (next !== prev) persistSidebarWidth(next);
        return next;
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Global ⌘B / Ctrl+B toggles the sidebar (pin/unpin).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        !e.repeat &&
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === 'b' &&
        !isTypingTarget(e.target)
      ) {
        e.preventDefault();
        if (peekCloseTimer.current) {
          clearTimeout(peekCloseTimer.current);
          peekCloseTimer.current = null;
        }
        setPeeking(false);
        setPinned((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setPinned]);

  // Global ⌘/ / Ctrl+/ toggles the Ask AI panel.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        !e.repeat &&
        (e.metaKey || e.ctrlKey) &&
        e.key === '/' &&
        !isTypingTarget(e.target)
      ) {
        e.preventDefault();
        setAiOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setAiOpen]);

  const handleSidebarResizePointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!pinned || !open) return;
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startWidth = sidebarWidth;
    const pointerId = e.pointerId;
    const handle = e.currentTarget;
    let dragged = false;
    let collapsedDuringDrag = false;
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    const previousRootCursor = document.documentElement.style.cursor;

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.documentElement.style.cursor = 'col-resize';
    handle.setPointerCapture(pointerId);

    const cleanup = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      if (handle.hasPointerCapture(pointerId)) {
        handle.releasePointerCapture(pointerId);
      }
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      document.documentElement.style.cursor = previousRootCursor;
      dragCleanupRef.current = null;
    };

    const finish = (togglePinned: boolean) => {
      cleanup();
      setSidebarDragging(false);
      if (dragged && !collapsedDuringDrag) {
        const nextWidth = clampSidebarWidth(startWidth + lastDelta);
        setSidebarWidth(nextWidth);
        persistSidebarWidth(nextWidth);
      }
      if (togglePinned) handleToggleClick();
    };

    const collapseNow = () => {
      if (collapsedDuringDrag) return;
      collapsedDuringDrag = true;
      setSidebarWidth(SIDEBAR_WIDTH_MIN);
      persistSidebarWidth(SIDEBAR_WIDTH_MIN);
      cleanup();
      setSidebarDragging(false);
      handleToggleClick();
    };

    let lastDelta = 0;

    const onPointerMove = (event: PointerEvent) => {
      if (collapsedDuringDrag) return;
      const delta = event.clientX - startX;
      lastDelta = delta;
      if (!dragged && Math.abs(delta) >= 3) {
        dragged = true;
        setSidebarDragging(true);
      }
      if (!dragged) return;

      const rawWidth = startWidth + delta;
      const nextWidth = clampSidebarWidth(rawWidth);
      const extraPullPastMin = Math.max(0, SIDEBAR_WIDTH_MIN - rawWidth);
      if (extraPullPastMin >= SIDEBAR_COLLAPSE_PULL_THRESHOLD) {
        collapseNow();
        return;
      }

      setSidebarWidth(nextWidth);
    };

    const onPointerUp = () => {
      finish(!dragged);
    };

    const onPointerCancel = () => {
      finish(false);
    };

    dragCleanupRef.current = cleanup;
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);
  };

  const open = pinned || peeking;
  const mode: SidebarMode = pinned ? 'pinned' : 'peek';

  return (
    <div className={cx(styles.shell, className)}>
      {/* Full-screen backdrop shown while the sidebar is peeking. */}
      <div
        className={cx(
          styles.peekBlanket,
          !pinned && peeking && styles.peekBlanketOpen,
        )}
        aria-hidden="true"
      />

      {/* ── Global sidebar (pinned: pushes content; peek: overlays) ── */}
      <GlobalSidebar
        open={open}
        dragging={sidebarDragging}
        mode={mode}
        width={sidebarWidth}
        activeItem={activeGlobalItem}
        onItemChange={handleGlobalNavChange}
        onPeekStart={startPeek}
        onPeekEnd={endPeek}
      />

      {/* ── Content column (header + body) ── */}
      <div className={styles.contentCol}>
        {pinned && open && (
          sidebarDragging ? (
            <button
              type="button"
              aria-label="Resize or collapse sidebar"
              className={cx(styles.sidebarResizeHandle, styles.sidebarResizeHandleDragging)}
              onPointerDown={handleSidebarResizePointerDown}
              onClick={(e) => e.preventDefault()}
            >
              <span className={styles.sidebarResizeHandleGrip} aria-hidden="true" />
            </button>
          ) : (
            <Tooltip
              label={'Click to collapse ⌘B\nDrag to resize'}
              placement="bottom"
              delay={150}
              followCursor
            >
              <button
                type="button"
                aria-label="Resize or collapse sidebar"
                className={styles.sidebarResizeHandle}
                onPointerDown={handleSidebarResizePointerDown}
                onClick={(e) => e.preventDefault()}
              >
                <span className={styles.sidebarResizeHandleGrip} aria-hidden="true" />
              </button>
            </Tooltip>
          )
        )}

        <AppHeader
          breadcrumb={breadcrumb}
          user={user}
          onToggleSidebar={handleToggleClick}
          sidebarOpen={pinned}
          onTogglePeekStart={startPeek}
          onTogglePeekEnd={endPeek}
          onAskAi={() => setAiOpen((v) => !v)}
          aiActive={aiOpen}
          onSearch={() => setSearchOpen(true)}
        />

        <div className={styles.body}>
          {showSecondarySidebar && secondarySidebar && (
            <Sidebar
              navItems={secondarySidebar.navItems}
              activeNav={ROUTE_TO_SECONDARY_NAV[route.name] ?? ''}
              onNavChange={handleSecondaryNavChange}
              directoryLabel={secondarySidebar.directoryLabel}
              view={ROUTE_TO_VIEW[route.name] ?? 'flat'}
              onViewChange={handleViewChange}
            />
          )}

          <main className={styles.main}>{children}</main>

          <AiPanel open={aiOpen} onClose={() => setAiOpen(false)} />
        </div>
      </div>
    </div>
  );
}
