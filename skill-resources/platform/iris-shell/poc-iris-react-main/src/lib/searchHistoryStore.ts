/**
 * searchHistoryStore — tiny localStorage wrapper for the command palette's
 * recent searches and recently viewed items.
 *
 * Storage layout:
 *   key:   `iris.search.v1.recentSearches` -> { version: 1, items: string[] }
 *   key:   `iris.search.v1.recentItems`    -> { version: 1, items: RecentItem[] }
 *
 * Failure model: every function is best-effort. Missing/disabled
 * localStorage (private mode, embedded webviews, SSR), JSON parse errors,
 * and quota errors all degrade silently so the palette never throws because
 * of a persistence problem.
 */

/** A previously opened palette result that can be re-run via its hash. */
export interface RecentItem {
  id: string;
  kind: 'page' | 'user';
  label: string;
  icon: string;
  secondary?: string;
  hash: string;
}

const SCHEMA_VERSION = 1;
const MAX_SEARCHES = 8;
const MAX_ITEMS = 8;

const SEARCHES_KEY = `iris.search.v${SCHEMA_VERSION}.recentSearches`;
const ITEMS_KEY = `iris.search.v${SCHEMA_VERSION}.recentItems`;

/** Probes window + localStorage in a try/catch — some embedded webviews
 *  throw on the access itself rather than on read/write. */
function isAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return 'localStorage' in window && window.localStorage !== null;
  } catch {
    return false;
  }
}

function read<T>(key: string, validate: (v: unknown) => v is T[]): T[] {
  if (!isAvailable()) return [];
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    return [];
  }
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* no-op */
    }
    return [];
  }
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    (parsed as { version?: unknown }).version !== SCHEMA_VERSION ||
    !Array.isArray((parsed as { items?: unknown }).items)
  ) {
    return [];
  }
  const items = (parsed as { items: unknown[] }).items;
  return validate(items) ? items : [];
}

function write<T>(key: string, items: T[]): void {
  if (!isAvailable()) return;
  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({ version: SCHEMA_VERSION, items }),
    );
  } catch {
    /* quota / disabled — best-effort */
  }
}

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string');

const isRecentItemArray = (v: unknown): v is RecentItem[] =>
  Array.isArray(v) &&
  v.every(
    (x) =>
      typeof x === 'object' &&
      x !== null &&
      typeof (x as RecentItem).id === 'string' &&
      ((x as RecentItem).kind === 'page' || (x as RecentItem).kind === 'user') &&
      typeof (x as RecentItem).label === 'string' &&
      typeof (x as RecentItem).icon === 'string' &&
      typeof (x as RecentItem).hash === 'string',
  );

/* ---------- recent searches (query strings) ---------- */

export function getRecentSearches(): string[] {
  return read(SEARCHES_KEY, (v): v is string[] => isStringArray(v));
}

export function addRecentSearch(query: string): void {
  const q = query.trim();
  if (!q) return;
  const next = [q, ...getRecentSearches().filter((s) => s.toLowerCase() !== q.toLowerCase())].slice(
    0,
    MAX_SEARCHES,
  );
  write(SEARCHES_KEY, next);
}

export function removeRecentSearch(query: string): void {
  write(
    SEARCHES_KEY,
    getRecentSearches().filter((s) => s !== query),
  );
}

/* ---------- recently viewed items ---------- */

export function getRecentItems(): RecentItem[] {
  return read(ITEMS_KEY, (v): v is RecentItem[] => isRecentItemArray(v));
}

export function addRecentItem(item: RecentItem): void {
  const next = [item, ...getRecentItems().filter((i) => i.id !== item.id)].slice(0, MAX_ITEMS);
  write(ITEMS_KEY, next);
}

export function removeRecentItem(id: string): void {
  write(
    ITEMS_KEY,
    getRecentItems().filter((i) => i.id !== id),
  );
}
