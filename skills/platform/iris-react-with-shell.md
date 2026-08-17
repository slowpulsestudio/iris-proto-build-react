# Iris Shell Rules

The Iris Shell is a multi-product navigation wrapper built on Iris UI foundations. It provides a consistent app header, global sidebar, secondary sidebar, and AI panel across all products. Use the reference implementation at `src/iris-shell/` — integrate from it, do not copy-paste wholesale.

---

## Architecture

Four layers, each only depending on the layer below:

| Layer | Path | Responsibility |
|---|---|---|
| Tokens | `src/iris-shell/src/tokens/*.css` | `--oi-*` CSS variables, 11 themes |
| Components | `src/iris-shell/src/components/**` | Stateless UI primitives, tokens only |
| Shell | `AppShell` + `AppHeader`, `GlobalSidebar`, `Sidebar`, `AiPanel` | Chrome around every page |
| Views | `src/views/**` | Page composition and data binding |

**A failed response looks like:**
- Skipping layers — a view directly manipulating token values instead of using a component
- Importing from a layer above (e.g. a component importing from a view)

---

## Adding a vertical (product)

A vertical is one record in `src/iris-shell/src/lib/verticals.ts` plus one route. That single record drives the product chooser, global sidebar, AI panel title, and optional secondary sidebar. Do not hardcode product chrome in individual views.

**A failed response looks like:**
- Adding product-specific navigation logic inside a view component instead of a `Vertical` record
- Duplicating chrome across multiple pages instead of wrapping in `AppShell`

---

## Routing

The shell uses a hash router (`src/iris-shell/src/lib/router.ts`) with no external dependencies. Routes are a discriminated union — add new routes to the union, do not use string literals. An empty hash normalises to the project-specific default route selected during setup; unknown hashes fall back to `usersList`.

During project setup, ask which URL route or deep link should open by default. It may be a top-level page, a subpage, or a route representing a table action. Add the selected route to the route union and configure it as the empty-hash fallback so it opens when the prototype starts.

**A failed response looks like:**
- Using `window.location.href` or `window.location.hash` directly instead of the `navigate()` helper
- Adding a route as a plain string instead of extending the discriminated union

---

## State management

No global state library. State is split by lifetime:

| Concern | Where |
|---|---|
| Shell chrome (AI panel open, secondary nav) | `AppShellContext` — lives above the route switch |
| In-page ephemeral state (search, selection) | `useState` in the page component |
| Theme, sidebar pin | `localStorage` via `useTheme`, `useSidebarPinned` |
| AI chat history | `localStorage` via `chatHistoryStore` (50 conversations per vertical) |

Long-lived shell state must go in `AppShellContext`. Page-scoped state must not leak into `AppShellContext`.

**A failed response looks like:**
- Storing page-scoped state (e.g. search query) in `AppShellContext`
- Reading/writing `localStorage` directly instead of using the provided store hooks

---

## Themes

The shell supports 11 themes (`light`, `dark`, `hc-light`, `hc-dark`, plus custom product themes). Themes are activated by a class on `<body>` (e.g. `class="theme-light"`). The active theme is controlled by `useTheme()` and persisted in `localStorage` under the key `ars.theme`.

Never hardcode a colour or token value that varies by theme.

**A failed response looks like:**
- Setting `document.body.className` directly instead of using `useTheme()`
- Using a hardcoded token value that only works in one theme

---

## AI panel

The AI panel (`AiPanel`) attaches context from the current page via `setAiContext([...])` + `setAiOpen(true)` in `AppShellContext`. The panel clears context on send via `clearAiContext()`. Chat history is persisted per-vertical in `localStorage` and capped at 50 conversations.

**A failed response looks like:**
- Passing AI context through props instead of `AppShellContext`
- Storing AI conversation state in a page component instead of `chatHistoryStore`

---

## Resources
poc-iris-react-main/ -> src/iris-shell/
