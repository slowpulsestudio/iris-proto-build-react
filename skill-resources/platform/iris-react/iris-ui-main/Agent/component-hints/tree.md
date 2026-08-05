# Tree — Functional Requirements and Hints

## Node structure

A tree renders a hierarchical list of nodes. Each node has a label and an optional icon. Nodes with children can be expanded or collapsed to show or hide their descendants.

## Node icons

Each node has an optional icon name. When no icon is provided the component selects a default based on the node's state:

- Node with children, collapsed → `Folder` icon
- Node with children, expanded → `FolderOpen` icon
- Leaf node (no children) → `Placeholder` icon, rendered in muted colour

When an explicit icon is given it is used as-is, with one exception: a node whose icon is `Folder` will automatically switch to `FolderOpen` while expanded.



Expanding a node reveals its direct children. Collapsing it hides all descendants. The component owns the expanded state — toggling a node flips its `expanded` flag directly. After each toggle the component emits the affected node so the consumer can react.

## Active node

One node at a time can be marked active by the consumer via an external identifier. Clicking a node emits a selection event and, if the node has children, also toggles its expanded state. The consumer decides whether to update the active identifier.

## Trailing icons

Each node row optionally shows trailing action icons on hover and when active. A node can individually opt out of showing trailing icons regardless of the global setting.

## Indent guides

Nested levels render vertical guide lines that visually connect siblings. The guide line for a column terminates at the midpoint of the last sibling row in that group, so there are no floating lines below the final child. A curve connector joins the vertical line to the node icon on the innermost column.

> **Do not modify the indent guide logic (`indentGuides`, `indentGuideArray`, `buildNestedIndentGuides` context) or the `__trail` SCSS rules.** The alignment, cutoff, and curve behaviour are intentional and fragile.

## Keyboard navigation

- **Enter / Space** — emits the selection event for the focused node.
- **Arrow Right** — expands a collapsed node that has children.
- **Arrow Left** — collapses an expanded node that has children.
- **Arrow Down / Arrow Up** — moves focus to the next or previous visible node row.
