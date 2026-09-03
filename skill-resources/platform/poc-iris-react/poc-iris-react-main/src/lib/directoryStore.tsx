import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react';

import {
  NODE_TREE,
  canMoveNode,
  getChildren,
  getLeafObjects,
  getNode,
  getNodeIcon,
  getNodePath,
  getObject,
  getTreeVersion,
  isContainerNode,
  moveNode,
  subscribeDirectory,
  type DirectoryNodeView,
  type DirectoryObject,
} from './directoryData.js';

/**
 * Directory store for the Tree view. Thin context over the static+memoized
 * `directoryData` helpers so consumers depend on a hook (mirrors `useUsers`)
 * and the data source can later swap to an API without touching pages.
 *
 * Provided **globally** in `App.tsx`: the sidebar `Tree` is shared chrome that
 * can call `useDirectory()` outside the tree routes, so a route-scoped
 * provider would throw.
 */

export interface DirectoryPathCrumb {
  id: string;
  name: string;
}

export interface DirectoryContextValue {
  nodeTree: DirectoryNodeView[];
  isContainer: (nodeId: string) => boolean;
  getPath: (nodeId: string) => DirectoryPathCrumb[];
  getChildren: (nodeId: string) => DirectoryObject[];
  getObject: (nodeId: string, objectId: string) => DirectoryObject | undefined;
  getNodeName: (nodeId: string) => string | undefined;
  getNodeIcon: (nodeId: string) => string;
  /** Leaf siblings of an object (for the detail prev/next pager). */
  getSiblings: (nodeId: string) => DirectoryObject[];
  /** Reparent a node under `newParentId` (`null` = top level). */
  moveNode: (nodeId: string, newParentId: string | null) => boolean;
  /** Whether a reparent is allowed (rejects no-ops + self/descendant drops). */
  canMoveNode: (nodeId: string, newParentId: string | null) => boolean;
}

const DirectoryContext = createContext<DirectoryContextValue | null>(null);

export function DirectoryProvider({ children }: { children: ReactNode }) {
  // Re-render whenever the tree structure changes (drag-and-drop reparenting).
  const version = useSyncExternalStore(subscribeDirectory, getTreeVersion, getTreeVersion);
  const value = useMemo<DirectoryContextValue>(
    () => ({
      nodeTree: NODE_TREE,
      isContainer: isContainerNode,
      getPath: (nodeId) => getNodePath(nodeId).map((n) => ({ id: n.id, name: n.name })),
      getChildren,
      getObject,
      getNodeName: (nodeId) => getNode(nodeId)?.name,
      getNodeIcon,
      getSiblings: getLeafObjects,
      moveNode,
      canMoveNode,
    }),
    [version],
  );

  return <DirectoryContext.Provider value={value}>{children}</DirectoryContext.Provider>;
}

export function useDirectory(): DirectoryContextValue {
  const ctx = useContext(DirectoryContext);
  if (!ctx) {
    throw new Error('useDirectory must be used inside <DirectoryProvider>');
  }
  return ctx;
}
