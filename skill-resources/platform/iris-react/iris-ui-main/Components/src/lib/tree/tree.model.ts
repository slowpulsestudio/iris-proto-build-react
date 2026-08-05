// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
/** Internal visual state of a tree node. Not a component input; driven by interaction events. */
export type TreeNodeState = 'default' | 'active' | 'hover';

/** A node in the tree hierarchy. Nodes with `children` are expandable. */
export interface TreeNode {
  /** Unique identifier for the node, used as the selection value. */
  id: string;
  /** Visible label text. */
  label: string;
  /** Optional icon name shown to the left of the label. */
  icon?: string;
  /** Whether the node is initially expanded when it has children. Defaults to `false`. */
  expanded?: boolean;
  /** Child nodes. When present, the node renders an expand/collapse toggle. */
  children?: TreeNode[];
  /** When `true`, trailing action icons (edit, delete, etc.) are shown on hover for this node. */
  showTrailingIcons?: boolean;
}
