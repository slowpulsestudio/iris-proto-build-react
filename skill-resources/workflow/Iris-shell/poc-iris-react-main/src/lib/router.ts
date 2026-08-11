import { useEffect, useState } from 'react';

/**
 * Tiny hash-based router for the PoC. No deps.
 *
 *   parseHash('#/users/abc')        -> { name: 'userDetail', params: { id: 'abc' } }
 *   parseHash('#/users')            -> { name: 'usersList',  params: {} }
 *   anything else                    -> { name: 'usersList', params: {} }
 *
 * To navigate: `navigate('#/users/abc')`. Components subscribe via `useRoute()`.
 */

export type Route =
  | { name: 'userDetail'; params: { id: string } }
  | { name: 'usersList'; params: Record<string, never> }
  | { name: 'treeRoot'; params: Record<string, never> }
  | { name: 'treeList'; params: { nodeId: string } }
  | { name: 'treeDetail'; params: { nodeId: string; objectId: string } }
  | { name: 'favoritesList'; params: Record<string, never> }
  | { name: 'groups'; params: Record<string, never> }
  | { name: 'devices'; params: Record<string, never> }
  | { name: 'agents'; params: Record<string, never> }
  | { name: 'applications'; params: Record<string, never> }
  | { name: 'accessTemplates'; params: Record<string, never> }
  | { name: 'managementUnits'; params: Record<string, never> }
  | { name: 'insights'; params: Record<string, never> }
  | { name: 'services'; params: Record<string, never> }
  | { name: 'identityHome'; params: Record<string, never> }
  | { name: 'safeguardHome'; params: Record<string, never> };

export type RouteName = Route['name'];

interface RouteDef {
  name: RouteName;
  pattern: RegExp;
  keys: string[];
}

const ROUTES: RouteDef[] = [
  { name: 'userDetail', pattern: /^#\/users\/([^/]+)$/, keys: ['id'] },
  { name: 'usersList', pattern: /^#\/users$/, keys: [] },
  { name: 'treeDetail', pattern: /^#\/tree\/([^/]+)\/([^/]+)$/, keys: ['nodeId', 'objectId'] },
  { name: 'treeList', pattern: /^#\/tree\/([^/]+)$/, keys: ['nodeId'] },
  { name: 'treeRoot', pattern: /^#\/tree$/, keys: [] },
  { name: 'favoritesList', pattern: /^#\/favorites$/, keys: [] },
  { name: 'groups', pattern: /^#\/groups$/, keys: [] },
  { name: 'devices', pattern: /^#\/devices$/, keys: [] },
  { name: 'agents', pattern: /^#\/agents$/, keys: [] },
  { name: 'applications', pattern: /^#\/applications$/, keys: [] },
  { name: 'accessTemplates', pattern: /^#\/access-templates$/, keys: [] },
  { name: 'managementUnits', pattern: /^#\/management-units$/, keys: [] },
  { name: 'insights', pattern: /^#\/insights$/, keys: [] },
  { name: 'services', pattern: /^#\/services$/, keys: [] },
  { name: 'identityHome', pattern: /^#\/identity$/, keys: [] },
  { name: 'safeguardHome', pattern: /^#\/safeguard$/, keys: [] },
];

const DEFAULT = '#/insights';

function parseHash(hash: string | null | undefined): Route {
  const h = hash || DEFAULT;
  for (const r of ROUTES) {
    const m = h.match(r.pattern);
    if (m) {
      const params: Record<string, string> = {};
      r.keys.forEach((k, i) => {
        params[k] = decodeURIComponent(m[i + 1]);
      });
      return { name: r.name, params } as Route;
    }
  }
  return { name: 'usersList', params: {} };
}

/**
 * Programmatic navigation. Updates the URL hash (and triggers `hashchange`
 * which `useRoute` listens to).
 */
export function navigate(path: string): void {
  if (typeof window === 'undefined') return;
  if (window.location.hash === path) return;
  window.location.hash = path;
  // Always scroll to top on route change for a real-page-navigation feel.
  window.scrollTo(0, 0);
}

/**
 * useRoute — returns the currently active route.
 */
function normalizeAddressBar(): void {
  if (typeof window === 'undefined') return;
  if (!window.location.hash) {
    window.history.replaceState(null, '', DEFAULT);
  }
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() =>
    typeof window === 'undefined'
      ? { name: 'usersList', params: {} }
      : parseHash(window.location.hash),
  );

  useEffect(() => {
    const onHashChange = () => {
      // Re-normalize whenever the hash is cleared (e.g. user edits the URL).
      normalizeAddressBar();
      setRoute(parseHash(window.location.hash));
    };
    window.addEventListener('hashchange', onHashChange);
    normalizeAddressBar();
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return route;
}
