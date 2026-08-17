import { createContext, useContext, useMemo, type ReactNode } from 'react';

import {
  NODE_TREE,
  getChildren,
  getLeafObjects,
  getNode,
  getNodeIcon,
  getNodePath,
  getObject,
  isContainerNode,
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
}

const DirectoryContext = createContext<DirectoryContextValue | null>(null);

export function DirectoryProvider({ children }: { children: ReactNode }) {
  // The underlying data is static + memoized, so the value never changes.
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
    }),
    [],
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
