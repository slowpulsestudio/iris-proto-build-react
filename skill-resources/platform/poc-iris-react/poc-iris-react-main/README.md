# App Shell w/ Iris UI (React)

A clickable prototype that puts Active Roles, Identity Manager, Safeguard, and On Demand Services behind one shell built on Iris UI foundations, with an inline AI panel, key user flows, and mock data.

## Quick start

Uses pnpm.

```bash
git clone https://github.com/oi-eng/poc-iris-react.git
cd poc-iris-react
pnpm install
pnpm dev        # dev server at http://localhost:5173
pnpm typecheck  # tsc --noEmit
pnpm build      # production build
pnpm preview    # serve the production build
```

## Features

- Unified app shell with header, global sidebar, optional secondary sidebar, and inline AI panel.
- One product switcher across Active Roles, Identity Manager, Safeguard, and On Demand Services.
- Identity Manager shell with a grouped tree sidebar, category headers, and a header role switcher.
- Directory users list with search, multi select, action bar, and copy Object ID.
- User detail with an edit properties side sheet and a reset password modal.
- Sidebar views Flat, Tree, and Favourites that each swap the whole rail.
- Tree browsing from node listing through to type driven object detail.
- Insights dashboard with stat cards and charts.
- Services catalogue with extensions.
- Ask AI panel with streamed replies, attach current selection, and per vertical chat history.
- Command palette on ⌘K for search, navigation, and actions.
- Advanced filter bar with chip based filters on the Users page.
- App wide keyboard shortcuts with full focus management.
- Eleven themes with dark as the default, persisted across reloads.

## Documentation

- [Architecture](docs/architecture.md) covers the four layers, codebase map, and design notes.
- [Routing](docs/routing.md) covers the hash router and route map.
- [State](docs/state.md) covers where state lives and how long it survives.
- [Key flows](docs/flows.md) covers vertical switching, AI attach, editing, and password reset.
- [Search, filters, and keyboard](docs/search-filters-keyboard.md) covers the command palette, filters, and shortcuts.
- [Developer notes](docs/developer-notes.md) covers conventions, gaps, and tips.
- [Product notes](docs/product-notes.md) covers coverage, accessibility, and limits.
