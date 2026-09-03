/**
 * commands — the searchable command/result model for the global command
 * palette, plus a small case-insensitive ranking filter.
 *
 * Items are a flat, serialisable-ish shape. Navigational items carry a
 * `hash` (routed via the hash router); imperative items carry a `run`
 * callback supplied by the palette (e.g. toggle AI panel, switch theme).
 */

import type { User } from '../views/UsersPage/mockUsers.js';
import { IDENTITY_NAV_GROUPS } from './identityNav.js';

/** Which slice of results the palette is scoped to. */
export type CommandScope = 'all' | 'users' | 'pages';

export interface CommandItem {
  id: string;
  kind: 'page' | 'user' | 'action' | 'ai';
  label: string;
  /** Named icon from the shared manifest. */
  icon: string;
  /** Secondary line (e.g. a user's email, or a page's area). */
  secondary?: string;
  /** Extra text folded into matching but not displayed. */
  keywords?: string;
  /** Hash route for navigational items (`page` / `user`). */
  hash?: string;
  /** Imperative handler for `action` / `ai` items. */
  run?: () => void;
}

/** Static "jump to" destinations. */
export const PAGE_ITEMS: CommandItem[] = [
  {
    id: 'page-users',
    kind: 'page',
    label: 'Users',
    icon: 'Users',
    hash: '#/users',
    secondary: 'Directory Management',
    keywords: 'directory people accounts groups',
  },
  {
    id: 'page-insights',
    kind: 'page',
    label: 'Insights',
    icon: 'ChartLineUp',
    hash: '#/insights',
    secondary: 'Analytics',
    keywords: 'analytics dashboard reports charts',
  },
  {
    id: 'page-services',
    kind: 'page',
    label: 'Services',
    icon: 'SquaresFour',
    hash: '#/services',
    secondary: 'Catalogue',
    keywords: 'catalog extensions apps',
  },
];

/** Identity Manager destinations — one item per grouped section leaf. Used to
 *  scope the command palette to the Identity Manager shell (its taxonomy),
 *  replacing the global page/user pools while that vertical is active. */
export const IDENTITY_COMMAND_ITEMS: CommandItem[] = IDENTITY_NAV_GROUPS.flatMap((group) =>
  group.items.map(
    (item): CommandItem => ({
      id: `idm-${group.id}-${item.value}`,
      kind: 'page',
      label: item.label,
      icon: item.icon,
      secondary: group.label,
      keywords: `${group.label} identity manager`,
      hash: item.route,
    }),
  ),
);

/** Map directory users into palette items linking to their detail page. */
export function buildUserItems(users: User[]): CommandItem[] {
  return users.map((u) => ({
    id: `user-${u.id}`,
    kind: 'user' as const,
    label: u.name,
    icon: 'User',
    secondary: u.email,
    keywords: `${u.objectId} ${u.status} ${u.description}`,
    hash: `#/users/${u.id}`,
  }));
}

function haystack(item: CommandItem): string {
  return [item.label, item.secondary, item.keywords]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

/**
 * Score an item against a lowercased query. Higher is better; 0 means no
 * match. Prefers exact → prefix → word-prefix → substring.
 */
export function scoreItem(item: CommandItem, q: string): number {
  const label = item.label.toLowerCase();
  if (label === q) return 100;
  if (label.startsWith(q)) return 80;
  if (label.split(/\s+/).some((w) => w.startsWith(q))) return 60;
  return haystack(item).includes(q) ? 40 : 0;
}

/** Rank + filter items by query. Empty query returns the list unchanged. */
export function filterItems(items: CommandItem[], query: string): CommandItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items
    .map((item) => ({ item, score: scoreItem(item, q) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.item);
}
