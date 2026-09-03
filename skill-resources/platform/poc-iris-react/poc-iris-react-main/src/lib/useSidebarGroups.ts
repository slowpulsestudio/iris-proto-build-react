import { useCallback, useEffect, useState } from 'react';

const STORAGE_PREFIX = 'ars.sidebar.groups.';

type CollapseMap = Record<string, boolean>;

function storageKey(verticalId: string): string {
  return `${STORAGE_PREFIX}${verticalId}`;
}

function readInitial(verticalId: string): CollapseMap {
  try {
    const raw = localStorage.getItem(storageKey(verticalId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as CollapseMap) : {};
  } catch {
    return {};
  }
}

export interface SidebarGroupsApi {
  /** Groups default to collapsed, so an unknown id reads as collapsed. */
  isCollapsed: (id: string) => boolean;
  toggle: (id: string) => void;
}

/**
 * useSidebarGroups — persists per-group collapsed/expanded state for a
 * vertical's grouped global sidebar. Keyed per vertical so groups from
 * different verticals never collide.
 *
 * Groups start **collapsed** by default. Because the map lives in
 * localStorage, every remounted `AppShell` (each navigation remounts the
 * shell) sees the same state, so collapse works consistently across views
 * and survives reloads.
 */
export function useSidebarGroups(verticalId: string): SidebarGroupsApi {
  const [map, setMap] = useState<CollapseMap>(() => readInitial(verticalId));

  // Re-read when the vertical changes (different storage bucket).
  useEffect(() => {
    setMap(readInitial(verticalId));
  }, [verticalId]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(verticalId), JSON.stringify(map));
    } catch {
      /* storage unavailable — silently ignore */
    }
  }, [verticalId, map]);

  const isCollapsed = useCallback(
    (id: string) => map[id] ?? true,
    [map],
  );

  const toggle = useCallback((id: string) => {
    setMap((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }));
  }, []);

  return { isCollapsed, toggle };
}
