import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import type { AiContextItem } from './aiContext.js';

export interface AppShellContextValue {
  aiOpen: boolean;
  /**
   * Full `useState` setter — accepts either a new boolean or a functional
   * updater `(prev) => next`. Prefer the updater form for toggles to avoid
   * dropping updates that land in the same tick.
   */
  setAiOpen: Dispatch<SetStateAction<boolean>>;
  /** Whether the global search / command palette (⌘K) is open. */
  searchOpen: boolean;
  /**
   * Full `useState` setter — accepts a boolean or a functional updater. The
   * updater form is preferred for the ⌘K toggle so rapid keypresses don't
   * drop updates landing in the same tick.
   */
  setSearchOpen: Dispatch<SetStateAction<boolean>>;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  /**
   * Pending attachments that will be sent with the next AI message.
   * Populated by views (e.g. UsersPage "Ask AI" action) and consumed by
   * AiPanel when the user sends, after which it auto-clears.
   */
  aiContext: AiContextItem[];
  /**
   * Full `useState` setter — accepts either a new array or a functional
   * updater `(prev) => next`. The updater form is preferred when the new
   * value depends on the current one (e.g. removing a single chip) to
   * avoid stale-state bugs.
   */
  setAiContext: Dispatch<SetStateAction<AiContextItem[]>>;
  clearAiContext: () => void;
}

/**
 * AppShellContext — holds chrome state that must survive page navigations.
 *
 * Each page wraps itself in <AppShell>, so every navigation remounts that
 * subtree. Anything stored in AppShell's local React state (e.g. the AI
 * panel toggle, the secondary nav selection) would reset on every route
 * change. Lifting that state here lets it persist for the session while
 * keeping the per-page AppShell API unchanged.
 *
 * `pinned` is handled separately by useSidebarPinned (localStorage-backed)
 * because users expect that one to survive reloads, not just navigations.
 */
const AppShellContext = createContext<AppShellContextValue | null>(null);

interface AppShellProviderProps {
  children: ReactNode;
}

/**
 * AppShellProvider — render once at the App root, above all routed pages.
 */
export function AppShellProvider({ children }: AppShellProviderProps) {
  const [aiOpen, setAiOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('users');
  const [aiContext, setAiContext] = useState<AiContextItem[]>([]);
  const clearAiContext = useCallback(() => setAiContext([]), []);

  const value = useMemo<AppShellContextValue>(
    () => ({
      aiOpen,
      setAiOpen,
      searchOpen,
      setSearchOpen,
      activeNav,
      setActiveNav,
      aiContext,
      setAiContext,
      clearAiContext,
    }),
    [aiOpen, searchOpen, activeNav, aiContext, clearAiContext],
  );

  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>;
}

/**
 * useAppShell — read/write the shared chrome state. Throws if used outside
 * <AppShellProvider> so misconfiguration is caught immediately.
 */
export function useAppShell(): AppShellContextValue {
  const ctx = useContext(AppShellContext);
  if (!ctx) {
    throw new Error('useAppShell must be used inside <AppShellProvider>');
  }
  return ctx;
}
