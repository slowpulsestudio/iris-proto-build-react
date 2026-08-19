import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'ars.globalSidebar.pinned';

/** Read the persisted pinned flag, defaulting to collapsed. */
function readInitial(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export type SetPinned = (next: boolean | ((prev: boolean) => boolean)) => void;

/**
 * useSidebarPinned — persists the global sidebar's pinned/expanded state
 * across page navigations and reloads (per-browser, via localStorage).
 *
 * Returns a `[pinned, setPinned]` tuple. `setPinned` accepts either a boolean
 * or an updater function, matching React's `useState` ergonomics.
 */
export function useSidebarPinned(): [boolean, SetPinned] {
  const [pinned, setPinnedState] = useState<boolean>(readInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, pinned ? '1' : '0');
    } catch {
      /* storage unavailable — silently ignore */
    }
  }, [pinned]);

  const setPinned: SetPinned = useCallback((next) => {
    setPinnedState((prev) => (typeof next === 'function' ? next(prev) : next));
  }, []);

  return [pinned, setPinned];
}
