---
name: poc-iris-react
description: Mandatory platform baseline — the Iris Shell and Iris UI reference implementation in src/iris-shell/ (tokens, components, shell chrome, views), standalone vs shell mode, and layer rules. Read before building, editing, or wiring any screen, component, or route in this project.
---

# POC Iris React Rules

The Iris Shell is a multi-product navigation wrapper built on Iris UI foundations. It provides a consistent app header, global sidebar, secondary sidebar, and AI panel across all products. Use the reference implementation at `src/iris-shell/` — integrate from it, do not copy-paste wholesale.

This shell baseline is manually synced from `https://github.com/oi-eng/poc-iris-react`.

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

## Standalone pages (no shell)

Not every product uses the Iris multi-product shell. When `shell-mode = standalone` in `.skill-answers` (set during `/skill-me-up`), build the page as bare content — tokens and components from `src/iris-shell/src/components/**` are still fair game, but do not wrap it in `AppShell`, and do not add `AppHeader`, `GlobalSidebar`, `Sidebar`, or `AiPanel` chrome, or a `verticals.ts` entry. OneLogin is a known example of a product with no shell chrome.

**A failed response looks like:**
- Wrapping a standalone page in `AppShell` "for consistency" when `shell-mode = standalone`
- Adding a `verticals.ts` vertical/nav entry for a standalone-mode product
- Assuming every prototype needs the header + global sidebar chrome

---

## Shell internals

Before adding a vertical, adding or changing a route, touching shell or page state, changing themes, or wiring the AI panel, read [references/shell-internals.md](references/shell-internals.md). Skip it for standalone pages.

| File | Contains |
|---|---|
| [references/shell-internals.md](references/shell-internals.md) | Adding a vertical, hash routing, state management by lifetime, themes, AI panel |

---

## Motion

Use `workflow/motion` for all motion principles, tokens, reduced-motion requirements, and definition-of-done checks. Do not duplicate or override those rules here.

---

## Resources
poc-iris-react-main/ -> src/iris-shell/
