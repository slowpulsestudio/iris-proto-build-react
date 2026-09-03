# Product notes

## P1 — What the PoC demonstrates

Active Roles and On-Demand Services share one shell; Identity Manager and Safeguard are landing-page stubs. A single product chooser swaps the vertical, and the chrome adapts copy, nav, and brand.

## P2 — Flows that work end-to-end

| Flow | Status |
|---|---|
| List directory users (search, multi-select, action bar, copy Object ID) | ✅ |
| Command palette (⌘K — search pages/users/actions, recents, scopes) | ✅ |
| Filter menu (Display Name / Object Type / Tags / Location / Date active / Date created) | ✅ |
| View user details (tabs — Overview only; prev/next pager) | ✅ |
| Edit user properties (side sheet, session-persistent) | ✅ |
| Reset password (3-state modal, readonly password + copy) | ✅ |
| Sidebar Flat ⇄ Tree ⇄ Favourites (route-driven; each swaps the whole rail) | ✅ |
| Tree view (interactive tree → node listing → type-driven object detail) | ✅ |
| Favourites (star objects from row/detail menus; curated shortcut list) | ✅ |
| Insights (three tabs, stat cards, two bar charts, donut) | ✅ |
| Services (catalogue + extensions) | ✅ |
| Ask AI about selection (chips → context prompts → streamed reply) | ✅ |
| AI chat history (per vertical, persisted, search + date grouping) | ✅ |
| Switch theme (11 themes, persisted, dark default) | ✅ |
| Switch product/vertical (updates nav, AI title, sidebar) | ✅ |

## P3 — Visible but inactive

These look interactive but currently no-op. Call out during demos.

- Sidebar "Other" nav items (Settings, Help) — disabled placeholders.
- Action bar bulk operations (Copy, Move, Properties, Delete).
- `Add user` split-button. `More actions` opens a menu but `Export CSV` is a no-op.
- UserDetailPage tabs other than Overview (Profile, Certificates, History) — "Coming soon".
- Service card actions (Sliders, Speedometer, "Get in touch", "Learn more", "Start free trial", Refresh, Status report).

## P4 — Accessibility

- Eleven themes: four core (Light, Dark, High contrast light, High contrast dark) plus seven custom "more themes" (Dracula, Night Owl, Ayu, One Dark Pro, Tokyo Night, Catppuccin, Monokai).
- `prefers-reduced-motion` respected by `AiPanel` and `Modal`.
- All interactive elements have `aria-label` or visible text.
- Keyboard operation and focus management are covered in [Search, filters & keyboard](search-filters-keyboard.md).
- Icon-only controls use the shared `Tooltip` (hover + keyboard, shortcut chips); native `title=` is not used.
- Overlays are hand-built — needs a formal a11y audit before production.

## P5 — Performance

- Bundle is dominated by the icon manifest ([A5](architecture.md#a5--icons-are-one-730-kb-json)).
- First paint is fast — no data fetching.
- AI panel uses simulated streaming (`5 chars / 16 ms`) + typing indicator, with a reduced-motion fallback.
- `DonutChart` reflows via a `@container` query, so the legend stacks under the donut when its card narrows (e.g. side sheet open) without depending on viewport breakpoints.

## P6 — What a customer cannot do yet

| Limitation | Impact |
|---|---|
| No backend | Edits vanish on reload. |
| Single hard-coded signed-in user | No auth story. |
| Static Insights data | Numbers don't move. |
| Service card actions are decorative | "Start free trial" does nothing. |
| Services has no sub-navigation | Single page only. |
