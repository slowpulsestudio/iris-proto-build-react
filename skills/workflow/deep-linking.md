# Deep-Linking in Tree Navigation

A pattern for making hierarchical tree navigation fully URL-addressable, so any node can be linked to directly and the tree will open, expand, and scroll to it correctly on load.

---

## Core principle

The selected node is always derived from the URL — never stored in local state. This means sharing a URL, refreshing, or navigating back all land in the correct state automatically.

---

## 1. Route as single source of truth

Derive `selectedId` from the current route. Do not maintain a separate `selectedNode` state variable.

**Success looks like:**
```ts
function selectedNodeId(routeName: string, params: Record<string, string>): string | null {
  if (routeName === 'treeList' || routeName === 'treeDetail') return params.nodeId ?? null;
  if (routeName === 'treeRoot') return FIRST_NODE_ID; // root route implies first node
  return null;
}

export function Tree() {
  const route = useRoute();
  const selectedId = selectedNodeId(route.name, route.params);
  // selectedId is the only source of truth — no useState for selection
}
```

**Failure looks like:**
```ts
// BAD: selection is local state, disconnected from the URL
const [selectedId, setSelectedId] = useState<string | null>(null);

const handleClick = (id: string) => {
  setSelectedId(id);           // only updates local state
  navigate(`#/tree/${id}`);    // URL updates separately — they can desync
};
```

---

## 2. Auto-expand ancestors

When `selectedId` changes (including on first render), find all ancestor nodes and add them to the `expanded` set. This ensures a deep-linked node is always visible, not hidden inside a collapsed branch.

**Success looks like:**
```ts
const [expanded, setExpanded] = useState<Set<string>>(() => new Set(ALL_NODE_IDS));

useEffect(() => {
  if (!selectedId) return;
  const ancestors = getPath(selectedId).map((n) => n.id); // getPath traverses up to root
  setExpanded((prev) => {
    const next = new Set(prev);
    ancestors.forEach((id) => next.add(id));
    return next;
  });
}, [selectedId, getPath]);
```

**Failure looks like:**
```ts
// BAD: expansion is only triggered by user click, not by route
const toggle = (id: string) => setExpanded(...);

// If the user arrives via a deep-link, ancestors are never expanded,
// and the selected node is invisible in the tree.
```

---

## 3. Scroll the selected node into view

In the tree node component, scroll to the row once it becomes selected. This handles the case where the node is off-screen on a deep-link arrival.

**Success looks like:**
```ts
function TreeNodeView({ node, isSelected }: Props) {
  const rowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isSelected) rowRef.current?.scrollIntoView({ block: 'nearest' });
  }, [isSelected]);

  return <div ref={rowRef} className={isSelected ? styles.selected : ''}>...</div>;
}
```

**Failure looks like:**
```ts
// BAD: scrolling on click only — doesn't fire on deep-link arrival
<div onClick={() => { navigate(...); rowRef.current?.scrollIntoView(); }}>
```

---

## 4. Stable, deterministic node IDs

Node IDs must be stable across page loads, reloads, and navigations — they live in the URL. IDs derived from database primary keys or static slugs are fine. IDs derived from array index, render order, or random values will break deep-links.

**Success looks like:**
```ts
// IDs come from the data source (e.g. a slug or DB primary key)
const nodes = [
  { id: 'corp-domain',        name: 'corp.example.com' },
  { id: 'managed-directories', name: 'Managed Directories' },
  { id: 'users-ou',           name: 'Users' },
];

// Or generated deterministically from a fixed seed
function makeNodeId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}
```

**Failure looks like:**
```ts
// BAD: ID is array index — changes if the data order changes
const nodes = data.map((item, i) => ({ id: String(i), name: item.name }));

// BAD: ID is random — a new value every render, every reload
const nodes = data.map((item) => ({ id: crypto.randomUUID(), name: item.name }));

// Sharing `#/tree/2` or `#/tree/f47ac10b` will land on a different node
// (or no node) after any data change or page reload.
```

---

## 5. Persisted entries must store the full route

Any feature that stores a reference to a node for later use (favourites, recents, bookmarks) must persist the full hash route alongside the ID — not just the ID. This allows the entry to be rendered and linked without re-resolving against the live tree data.

**Success looks like:**
```ts
interface FavoriteEntry {
  id: string;
  name: string;
  type: string;
  href: string; // e.g. '#/tree/users-ou' — stored at the time of favouriting
}

// The Favourites page renders a plain anchor; no tree lookup required
<a href={entry.href}>{entry.name}</a>
```

**Failure looks like:**
```ts
// BAD: only the ID is stored
interface FavoriteEntry {
  id: string;
  name: string;
}

// The Favourites page now has to load and traverse the full tree
// just to reconstruct the URL — fails if tree data hasn't loaded yet.
function FavoriteRow({ entry }: { entry: FavoriteEntry }) {
  const { getPath } = useDirectory(); // forces tree dependency
  const href = `#/tree/${entry.id}`;  // works, but fragile if route shape changes
}
```

---

## Summary checklist

- [ ] `selectedId` is derived from the route, not stored in `useState`
- [ ] A `useEffect` on `selectedId` expands all ancestor nodes
- [ ] A `useEffect` on `isSelected` scrolls the row into view
- [ ] Node IDs are stable across reloads (not index- or random-based)
- [ ] Persisted entries (favourites, recents) store the full `href`, not just the `id`
