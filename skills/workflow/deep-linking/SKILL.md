---
name: deep-linking
description: Pattern for making hierarchical tree navigation fully URL-addressable (selection from the route, auto-expand ancestors, scroll into view, stable node IDs, persisted hrefs). Read when building or changing tree navigation, favourites, recents, bookmarks, or anything that links to a node.
---

# Deep-Linking in Tree Navigation

A pattern for making hierarchical tree navigation fully URL-addressable, so any node can be linked to directly and the tree opens, expands, and scrolls to it correctly on load.

**Core principle:** the selected node is always derived from the URL — never stored in local state. Sharing a URL, refreshing, or navigating back all land in the correct state automatically.

## Rules

1. **Route as single source of truth** — derive `selectedId` from the current route. No separate `selectedNode` state, and never `useState` for selection.
2. **Auto-expand ancestors** — an effect on `selectedId` (including first render) adds every ancestor to the `expanded` set, so a deep-linked node is never hidden in a collapsed branch.
3. **Scroll the selected node into view** — an effect on `isSelected` in the node row scrolls it into view, so it works on deep-link arrival and not only on click.
4. **Stable, deterministic node IDs** — IDs come from the data source (slug or primary key), never array index, render order, or random values.
5. **Persisted entries store the full route** — favourites, recents, and bookmarks store the full hash route (`href`) alongside the ID, so they render and link without re-resolving against live tree data.

**A failed response looks like:**
- Storing selection in `useState` and updating the URL separately so they can desync
- Expanding branches only on user click, so deep-linked nodes are invisible
- Scrolling only in a click handler
- Using array index or `crypto.randomUUID()` as a node ID
- Persisting only the node `id` for a favourite and rebuilding its URL from the tree later

## References

Read before implementing any of the rules above:

| File | Contains |
|---|---|
| [references/examples.md](references/examples.md) | Success and failure code examples for each rule |

## Summary checklist

- [ ] `selectedId` is derived from the route, not stored in `useState`
- [ ] A `useEffect` on `selectedId` expands all ancestor nodes
- [ ] A `useEffect` on `isSelected` scrolls the row into view
- [ ] Node IDs are stable across reloads (not index- or random-based)
- [ ] Persisted entries (favourites, recents) store the full `href`, not just the `id`
