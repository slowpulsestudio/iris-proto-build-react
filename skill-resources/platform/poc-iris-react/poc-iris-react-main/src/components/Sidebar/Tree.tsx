import { useEffect, useRef, useState, type DragEvent, type MouseEvent } from 'react';
import { cx } from '../../lib/cx.js';
import { navigate, useRoute } from '../../lib/router.js';
import { useDirectory } from '../../lib/directoryStore.js';
import {
  ALL_NODE_IDS,
  FIRST_NODE_ID,
  type DirectoryNodeView,
} from '../../lib/directoryData.js';
import { Icon } from '../Icon/Icon.js';
import { Menu, type MenuEntry } from '../Menu/Menu.js';
import styles from './Tree.module.css';

// Object types offered under the context menu's "Create" submenu. Mirrors
// the Users page "Create" button options.
const CREATE_ITEMS: MenuEntry[] = [
  { kind: 'item', label: 'User', icon: 'User' },
  { kind: 'item', label: 'Group', icon: 'UsersThree' },
  { kind: 'divider' },
  { kind: 'item', label: 'Computer', icon: 'Devices' },
  { kind: 'divider' },
  { kind: 'item', label: 'Organizational Unit', icon: 'FolderPlus' },
  { kind: 'item', label: 'Shared Folder', icon: 'Folders' },
  { kind: 'divider' },
  { kind: 'item', label: 'Contact', icon: 'AddressBook' },
  { kind: 'item', label: 'Group Management Service Account', icon: 'UserCircle' },
];

// Right-click context menu for a directory tree item.
const CONTEXT_ITEMS: MenuEntry[] = [
  { kind: 'submenu', label: 'Create', icon: 'Plus', items: CREATE_ITEMS },
  { kind: 'item', label: 'View properties', icon: 'UserList' },
  { kind: 'item', label: 'Move', icon: 'Folder' },
  { kind: 'item', label: 'Add to Favorites', icon: 'Heart' },
  { kind: 'divider' },
  { kind: 'item', label: 'Delete', icon: 'Trash', danger: true },
];

/** The tree node id (if any) selected by the current route. */
function selectedNodeId(routeName: string, params: Record<string, string>): string | null {
  if (routeName === 'treeList' || routeName === 'treeDetail') return params.nodeId ?? null;
  // `#/tree` has no node in the URL but lands on the first node's listing, so
  // reflect that as the selected item.
  if (routeName === 'treeRoot') return FIRST_NODE_ID;
  return null;
}

/**
 * Tree — interactive directory tree for the sidebar's "Tree view" mode.
 *
 * Data-driven from `useDirectory()`. Clicking a node navigates to its listing
 * (`#/tree/:nodeId`); the selected node + expanded ancestors are derived from
 * the route so deep-links and drill-in stay in sync.
 */
export function Tree() {
  const { nodeTree, getPath, moveNode, canMoveNode } = useDirectory();
  const route = useRoute();
  const selectedId = selectedNodeId(route.name, route.params as Record<string, string>);

  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  // Fully unfurled by default; users can still collapse individual nodes.
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(ALL_NODE_IDS));
  // Drag-and-drop reparenting state.
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  // Auto-expand the ancestors of the selected node (deep-link + drill-in).
  useEffect(() => {
    if (!selectedId) return;
    const ancestors = getPath(selectedId).map((n) => n.id);
    setExpanded((prev) => {
      const next = new Set(prev);
      ancestors.forEach((id) => next.add(id));
      return next;
    });
  }, [selectedId, getPath]);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleDragStart = (e: DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(id);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDropTargetId(null);
  };

  const handleDragOver = (e: DragEvent, targetId: string) => {
    if (!draggingId) return;
    if (!canMoveNode(draggingId, targetId)) {
      e.dataTransfer.dropEffect = 'none';
      if (dropTargetId === targetId) setDropTargetId(null);
      return;
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dropTargetId !== targetId) setDropTargetId(targetId);
  };

  const handleDrop = (e: DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = draggingId ?? e.dataTransfer.getData('text/plain');
    if (sourceId && moveNode(sourceId, targetId)) {
      // Reveal the moved node under its new parent.
      setExpanded((prev) => new Set(prev).add(targetId));
    }
    setDraggingId(null);
    setDropTargetId(null);
  };

  const openContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    // Keyboard-invoked context menus (ContextMenu key / Shift+F10) dispatch a
    // `contextmenu` event with clientX/clientY = 0. Fall back to anchoring at
    // the bottom-left of the row so it doesn't jump to the viewport corner.
    if (e.clientX === 0 && e.clientY === 0) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setMenuPos({ x: rect.left, y: rect.bottom });
      return;
    }
    setMenuPos({ x: e.clientX, y: e.clientY });
  };

  return (
    <>
      <ul className={styles.tree} aria-label="Directory tree">
        {nodeTree.map((node) => (
          <TreeNodeView
            key={node.id}
            node={node}
            depth={0}
            selectedId={selectedId}
            expanded={expanded}
            onToggle={toggle}
            onContextMenu={openContextMenu}
            draggingId={draggingId}
            dropTargetId={dropTargetId}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            separatorBefore={node.id === 'managed-directories'}
          />
        ))}
      </ul>
      <Menu
        ariaLabel="Directory item actions"
        items={CONTEXT_ITEMS}
        open={menuPos !== null}
        onOpenChange={(o) => {
          if (!o) setMenuPos(null);
        }}
        position={menuPos ?? undefined}
      />
    </>
  );
}

interface TreeNodeViewProps {
  node: DirectoryNodeView;
  depth: number;
  selectedId: string | null;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onContextMenu: (e: MouseEvent) => void;
  draggingId: string | null;
  dropTargetId: string | null;
  onDragStart: (e: DragEvent, id: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: DragEvent, targetId: string) => void;
  onDrop: (e: DragEvent, targetId: string) => void;
  separatorBefore?: boolean;
}

function TreeNodeView({
  node,
  depth,
  selectedId,
  expanded,
  onToggle,
  onContextMenu,
  draggingId,
  dropTargetId,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  separatorBefore,
}: TreeNodeViewProps) {
  const hasChildren = node.hasChildren;
  const open = expanded.has(node.id);
  const isSelected = node.id === selectedId;
  const isDragging = node.id === draggingId;
  const isDropTarget = node.id === dropTargetId;
  const rowRef = useRef<HTMLDivElement | null>(null);

  // Reveal the selected node (e.g. on deep-link) once its ancestors expand.
  useEffect(() => {
    if (isSelected) rowRef.current?.scrollIntoView({ block: 'nearest' });
  }, [isSelected]);

  return (
    <>
      {separatorBefore && (
        <li className={styles.separator} role="separator" aria-hidden="true" />
      )}
      <li>
        <div
          ref={rowRef}
          className={cx(
            styles.row,
            isSelected && styles.rowSelected,
            isDragging && styles.rowDragging,
            isDropTarget && styles.rowDropTarget,
          )}
          style={{ paddingLeft: `calc(${depth} * var(--oi-spacing-m))` }}
          draggable
          onDragStart={(e) => onDragStart(e, node.id)}
          onDragEnd={onDragEnd}
          onDragOver={(e) => onDragOver(e, node.id)}
          onDrop={(e) => onDrop(e, node.id)}
          onContextMenu={onContextMenu}
        >
          {hasChildren ? (
            <button
              type="button"
              className={styles.caret}
              aria-label={open ? 'Collapse' : 'Expand'}
              aria-expanded={open}
              onClick={(e) => {
                e.stopPropagation();
                onToggle(node.id);
              }}
            >
              <Icon name={open ? 'CaretDown' : 'CaretRight'} size="12px" />
            </button>
          ) : (
            <span className={styles.caret} aria-hidden="true" />
          )}

          <button
            type="button"
            className={styles.nodeButton}
            aria-current={isSelected ? 'page' : undefined}
            onClick={() => navigate(`#/tree/${node.id}`)}
          >
            <span className={styles.folderIcon} aria-hidden="true">
              <Icon
                name={node.icon ?? (hasChildren && open ? 'FolderOpen' : 'Folder')}
                size="16px"
              />
            </span>
            <span className={styles.label} title={node.name}>
              {node.name}
            </span>
          </button>
        </div>

        {hasChildren && open && (
          <ul className={styles.children}>
            {node.children.map((child) => (
              <TreeNodeView
                key={child.id}
                node={child}
                depth={depth + 1}
                selectedId={selectedId}
                expanded={expanded}
                onToggle={onToggle}
                onContextMenu={onContextMenu}
                draggingId={draggingId}
                dropTargetId={dropTargetId}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
                onDrop={onDrop}
              />
            ))}
          </ul>
        )}
      </li>
    </>
  );
}
