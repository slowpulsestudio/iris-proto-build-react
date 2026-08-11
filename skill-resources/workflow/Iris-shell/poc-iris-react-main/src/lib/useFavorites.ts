import { useCallback, useSyncExternalStore } from 'react';
import { showToast } from './toastStore.js';

/**
 * useFavorites — a global list of "favorited" directory objects, persisted to
 * localStorage and shared via a module-level store so every consumer (the
 * Favourites page, row menus) stays in sync without a provider.
 *
 * Stores lightweight entries (not bare ids) so the Favourites listing can
 * render + deep-link them without resolving against the lazy directory data.
 */

const STORAGE_KEY = 'ars.favorites';

export interface FavoriteEntry {
  id: string;
  name: string;
  /** Human label, e.g. an object-type label. */
  type: string;
  description?: string;
  /** Hash route the row links to. */
  href: string;
}

function read(): FavoriteEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.filter(
      (e): e is FavoriteEntry =>
        !!e && typeof (e as FavoriteEntry).id === 'string' && typeof (e as FavoriteEntry).href === 'string',
    );
  } catch {
    return [];
  }
}

let current = read();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    /* storage unavailable — ignore */
  }
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export interface FavoritesApi {
  entries: FavoriteEntry[];
  isFavorite: (id: string) => boolean;
  /** Add if absent, remove if present. */
  toggle: (entry: FavoriteEntry) => void;
  remove: (id: string) => void;
}

export function useFavorites(): FavoritesApi {
  const entries = useSyncExternalStore(subscribe, () => current);

  const toggle = useCallback((entry: FavoriteEntry) => {
    const exists = current.some((e) => e.id === entry.id);
    current = exists ? current.filter((e) => e.id !== entry.id) : [...current, entry];
    persist();
    emit();
    showToast(
      exists ? `${entry.name} removed from favourites` : `${entry.name} added to favourites`,
    );
  }, []);

  const remove = useCallback((id: string) => {
    const entry = current.find((e) => e.id === id);
    current = current.filter((e) => e.id !== id);
    persist();
    emit();
    if (entry) showToast(`${entry.name} removed from favourites`);
  }, []);

  const isFavorite = useCallback((id: string) => entries.some((e) => e.id === id), [entries]);

  return { entries, isFavorite, toggle, remove };
}
