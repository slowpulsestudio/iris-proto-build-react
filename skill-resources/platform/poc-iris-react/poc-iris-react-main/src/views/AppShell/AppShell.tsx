import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { cx } from '../../lib/cx.js';
import { AppHeader, type Crumb, type HeaderUser } from '../../components/AppHeader/AppHeader.js';
import { GlobalSidebar, type SidebarMode } from '../../components/GlobalSidebar/GlobalSidebar.js';
import { Sidebar } from '../../components/Sidebar/Sidebar.js';
import { AiPanel } from '../../components/AiPanel/AiPanel.js';
import { Tooltip } from '../../components/Tooltip/Tooltip.js';
import { Menu } from '../../components/Menu/Menu.js';
import { IconButton } from '../../components/IconButton/IconButton.js';
import { navigate, useRoute } from '../../lib/router.js';
import { useSidebarPinned } from '../../lib/useSidebarPinned.js';
import { useAppShell } from '../../lib/appShellContext.js';
import { useVertical } from '../../lib/verticals.js';
import { IDENTITY_ROLES, filterIdentityGroups } from '../../lib/identityNav.js';
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

const DIRECTORY_SIDEBAR_WIDTH_STORAGE_KEY = 'ars.directorySidebar.width';
const DIRECTORY_SIDEBAR_WIDTH_DEFAULT = 254;
const DIRECTORY_SIDEBAR_WIDTH_MIN = 220;
const DIRECTORY_SIDEBAR_WIDTH_MAX = 420;
// Smallest usable width for the main surface. Widening the directory rail past
// the point where main would drop below this auto-closes the AI panel (if open)
// and is otherwise capped so the AI panel / main never get clipped.
const MAIN_MIN_WIDTH = 360;
// Extra px past the AI-open max the user must drag before the panel auto-closes.
const AI_AUTOCLOSE_HYSTERESIS = 24;

function persistDirectorySidebarWidth(width: number) {
  try {
    localStorage.setItem(DIRECTORY_SIDEBAR_WIDTH_STORAGE_KEY, String(width));
  } catch {
    /* storage unavailable — silently ignore */
  }
}

function clampDirectorySidebarWidth(value: number, dynamicMax: number) {
  const max = Math.max(DIRECTORY_SIDEBAR_WIDTH_MIN, Math.min(DIRECTORY_SIDEBAR_WIDTH_MAX, dynamicMax));
  return Math.min(max, Math.max(DIRECTORY_SIDEBAR_WIDTH_MIN, value));
}

function readInitialDirectorySidebarWidth(): number {
  try {
    const raw = localStorage.getItem(DIRECTORY_SIDEBAR_WIDTH_STORAGE_KEY);
    if (!raw) return DIRECTORY_SIDEBAR_WIDTH_DEFAULT;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed)
      ? Math.min(DIRECTORY_SIDEBAR_WIDTH_MAX, Math.max(DIRECTORY_SIDEBAR_WIDTH_MIN, parsed))
      : DIRECTORY_SIDEBAR_WIDTH_DEFAULT;
  } catch {
    return DIRECTORY_SIDEBAR_WIDTH_DEFAULT;
  }
}

/** Largest directory-rail width that keeps `.main` ≥ MAIN_MIN_WIDTH, measured
 *  live from `.body` so it reflects the pinned global sidebar, window size, and
 *  the AI panel width. Children are always [sidebar, main, (aiPanel)]. */
function availableDirectoryMax(bodyEl: HTMLElement, aiOpen: boolean): number {
  const bodyInner = bodyEl.clientWidth;
  const gap = Number.parseFloat(getComputedStyle(bodyEl).columnGap) || 0;
  const aiWidth = aiOpen ? (bodyEl.lastElementChild as HTMLElement | null)?.offsetWidth ?? 0 : 0;
  const reserved = aiOpen ? aiWidth + 2 * gap : gap;
  return bodyInner - reserved - MAIN_MIN_WIDTH;
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
  const { aiOpen, setAiOpen, setSearchOpen, identityRole, setIdentityRole } = useAppShell();
  const [pinned, setPinned] = useSidebarPinned();
  const [peeking, setPeeking] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(readInitialSidebarWidth);
  const [sidebarDragging, setSidebarDragging] = useState(false);
  const [directorySidebarWidth, setDirectorySidebarWidth] = useState(
    readInitialDirectorySidebarWidth,
  );
  const [directorySidebarDragging, setDirectorySidebarDragging] = useState(false);
  const vertical = useVertical();
  const route = useRoute();
  const secondarySidebar = vertical.secondarySidebar;
  const dragCleanupRef = useRef<(() => void) | null>(null);
  const directoryDragCleanupRef = useRef<(() => void) | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  const isIdentity = vertical.id === 'identity-manager';
  // IdM scopes its grouped nav by the previewed role; other grouped verticals
  // (none today) would show every group.
  const sidebarGroups = vertical.navGroups
    ? isIdentity
      ? filterIdentityGroups(identityRole)
      : vertical.navGroups
    : undefined;

  const handleGlobalNavChange = (value: string) => {
    if (value.startsWith('#')) {
      navigate(value);
      return;
    }
    const target = GLOBAL_NAV_ROUTES[value];
    if (target) navigate(target);
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
      directoryDragCleanupRef.current?.();
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

  // Re-fit the directory rail whenever available space shrinks for reasons
  // other than its own drag — window resize, the global sidebar being
  // pinned/resized, or the AI panel opening while the rail is already wide
  // (the rail yields; the panel stays open, opposite to the active-drag case).
  // Gated on the rail actually being rendered so it never measures/persists
  // against a `.body` that lacks the sidebar child.
  const hasDirectorySidebar = showSecondarySidebar && Boolean(secondarySidebar);
  useEffect(() => {
    const el = bodyRef.current;
    if (!hasDirectorySidebar || !el || typeof ResizeObserver === 'undefined') return undefined;
    const refit = () =>
      setDirectorySidebarWidth((prev) => {
        const next = clampDirectorySidebarWidth(prev, availableDirectoryMax(el, aiOpen));
        if (next !== prev) persistDirectorySidebarWidth(next);
        return next;
      });
    refit();
    const ro = new ResizeObserver(refit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [aiOpen, hasDirectorySidebar]);

  const handleDirectorySidebarResizePointerDown = (
    e: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const bodyEl = bodyRef.current;
    if (!bodyEl) return;

    const startX = e.clientX;
    const startWidth = directorySidebarWidth;
    const pointerId = e.pointerId;
    const handle = e.currentTarget;
    const maxWithAi = availableDirectoryMax(bodyEl, true);
    const maxNoAi = availableDirectoryMax(bodyEl, false);
    let dragged = false;
    let aiOpenNow = aiOpen;
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
      directoryDragCleanupRef.current = null;
    };

    let lastWidth = startWidth;

    const finish = () => {
      cleanup();
      setDirectorySidebarDragging(false);
      persistDirectorySidebarWidth(lastWidth);
    };

    const onPointerMove = (event: PointerEvent) => {
      const raw = startWidth + (event.clientX - startX);
      if (!dragged && Math.abs(event.clientX - startX) >= 3) {
        dragged = true;
        setDirectorySidebarDragging(true);
      }
      if (!dragged) return;
      // Widening past the point where main would be crushed auto-closes the AI
      // panel once, freeing its width so the drag can continue.
      if (aiOpenNow && raw > maxWithAi + AI_AUTOCLOSE_HYSTERESIS) {
        setAiOpen(false);
        aiOpenNow = false;
      }
      const dynamicMax = aiOpenNow ? maxWithAi : maxNoAi;
      lastWidth = clampDirectorySidebarWidth(raw, dynamicMax);
      setDirectorySidebarWidth(lastWidth);
    };

    const onPointerUp = () => finish();
    const onPointerCancel = () => finish();

    directoryDragCleanupRef.current = cleanup;
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);
  };

  const open = pinned || peeking;
  const mode: SidebarMode = pinned ? 'pinned' : 'peek';

  const activeRoleLabel =
    IDENTITY_ROLES.find((r) => r.id === identityRole)?.label ?? IDENTITY_ROLES[0].label;
  const roleSwitcher = isIdentity ? (
    <Menu
      ariaLabel="Preview as role"
      align="end"
      items={IDENTITY_ROLES.map((r) => ({
        kind: 'item',
        label: r.label,
        icon: r.icon,
        selected: r.id === identityRole,
        onSelect: () => setIdentityRole(r.id),
      }))}
      trigger={({ ref, onClick, expanded }) => (
        <IconButton
          ref={ref as React.Ref<HTMLButtonElement>}
          icon="UserSwitch"
          ariaLabel={`Preview as: ${activeRoleLabel}`}
          aria-haspopup="menu"
          aria-expanded={expanded}
          onClick={onClick}
        />
      )}
    />
  ) : undefined;

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
        navGroups={sidebarGroups}
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
          roleSwitcher={roleSwitcher}
        />

        <div className={styles.body} ref={bodyRef}>
          {showSecondarySidebar && secondarySidebar && (
            <Sidebar
              navItems={secondarySidebar.navItems}
              activeNav={ROUTE_TO_SECONDARY_NAV[route.name] ?? ''}
              onNavChange={handleSecondaryNavChange}
              directoryLabel={secondarySidebar.directoryLabel}
              view={ROUTE_TO_VIEW[route.name] ?? 'flat'}
              onViewChange={handleViewChange}
              width={directorySidebarWidth}
              dragging={directorySidebarDragging}
              onResizePointerDown={handleDirectorySidebarResizePointerDown}
            />
          )}

          <main className={styles.main}>{children}</main>

          <AiPanel open={aiOpen} onClose={() => setAiOpen(false)} />
        </div>
      </div>
    </div>
  );
}
