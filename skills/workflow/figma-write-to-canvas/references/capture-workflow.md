# Figma Write to Canvas — Capture Workflow

Read this after the destination page has been resolved and validated per "Figma canvas: page scope + destination lock" in `SKILL.md`. The destination lock, the explicit-confirmation rule for destructive edits, and the link-not-node-ID rule in `SKILL.md` all still apply to every step below.

## Choose a workflow

| Goal | Figma skill |
| --- | --- |
| Put a running local prototype into Figma | No dedicated skill for this exact workflow — trigger Figma's `generate_figma_design` tool ("code to canvas") with a plain-language prompt, e.g. "Start a local server for my app and capture the UI on this Figma page: `<🤖-prefixed destination page URL>`" |
| Put coded screens and tokens into Figma | `/figma-generate-design` and `/figma-generate-library` |
| Explore a design direction from a problem statement | `/figma-use` |

`figma-generate-design`, `figma-generate-library`, and `figma-use` are real Figma-provided skills — this repo does not install them. They ship automatically via the Figma plugin in supported clients (Claude Code, Cursor, VS Code, etc.) once the remote MCP server is connected, or can be downloaded manually from Figma's `mcp-server-guide` repo on GitHub if a client doesn't support plugins. If one is missing, that's a client/environment setup issue — report it as such rather than inventing a substitute command.

## Default approach: rough reference, then design system

Before starting any capture, state the plan to the Designer in one short sentence, e.g.:

> "First I'll do a rough version for reference, then I'll link up the Iris design system components and tokens. We can then refine after, issue by issue."

Then follow these steps, in order:

1. **Capture a rough reference** — resolve the destination page per "Figma canvas: page scope + destination lock" in `SKILL.md`, then prompt Figma's `generate_figma_design` tool in plain language to capture the running prototype pixel-for-pixel on that page (e.g. "Start a local server for my app and capture the UI on this Figma page: `<🤖-prefixed destination page URL>`"). This is raw DOM/CSS, disconnected from the design system, and exists only as a temporary visual reference.
2. **Look for an existing screen to clone** — before building anything from scratch, search the target Figma file/page for a screen that's already structurally close to the target. Cloning and adapting real, already-composed component instances (auto-layout, bound variables) is far more reliable than assembling one from `search_design_system` results component-by-component.
3. **Rebuild using the Iris design system** — always real Iris UI components and Iris UI Variables (tokens), never disconnected colours, shapes, or hardcoded text styling. Detach nested instances only where a structural change is required (column reorder, re-parenting children) — Figma blocks structural edits on instance descendants.
4. **Refine one section at a time** — screenshot after each section (header, table, action bar, etc.) before moving to the next, and fix issues one at a time rather than making sweeping changes across the whole screen at once.
5. **Deep-review design system linkage** — after wiring up the attempted components and tokens for a section, audit every element individually: confirm it is a real bound instance of an Iris UI Kit component (not a plain frame/rectangle/text node styled to merely look like one), and confirm every style value (color, spacing, radius, typography, elevation, etc.) is bound to an actual Figma variable/token, not a raw hardcoded value that happens to visually match. Produce a full report listing every component and token checked, marked with a tick (✅) for anything successfully linked/bound and a cross (❌) for anything that could not be matched — for each ❌, state plainly what stand-in was used instead and that a matching component/token could not be found. Present this report to the Designer and ask them to point to the correct component or token for each ❌ item.
6. **Delete the rough reference only once the rebuild is verified** — and only with the Designer's explicit confirmation (see "Confirm before deleting or modifying anything on the canvas" in `SKILL.md`).

**A successful response looks like:**
- Stating the two-phase plan to the Designer before starting a capture
- Checking for an existing similar screen before building from scratch
- A full ✅/❌ report covering every component and token used, with each ❌ explained and handed to the Designer to resolve
- Deleting the rough reference only after verification and explicit confirmation

**A failed response looks like:**
- Starting a capture without first stating the two-phase plan to the Designer
- Building the design-system version from scratch instead of checking for an existing similar screen first
- Leaving any part of the rebuilt screen using raw/disconnected styling instead of real Iris components and tokens
- Refining multiple sections at once with no screenshot checkpoint in between
- Declaring a section complete because it looks right on screen, without auditing individual component/token bindings
- Silently substituting a "close enough" component or a hardcoded value for a ❌ item instead of flagging it
- Deleting the rough reference capture before the rebuild is verified, or without explicit confirmation

## How to use it

Start the local app. Then include all of the following in the prompt:

- The local app URL, or the screens/problem statement if using a skill instead
- The '🤖'-prefixed destination page URL, resolved via `.figma-code-to-canvas-destination` (never `.figma-url`)
- The screens, components, and token constraints to follow

Example:

```text
Start a local server for my app and capture the UI at http://localhost:5173 onto this Figma page:
<🤖-prefixed destination page URL>

Include every unique screen. Use the existing design-system components and map
the project's tokens where possible.
```

The result is a starting point for review. Refine spacing, layout, and visual decisions directly in Figma rather than repeatedly re-running the skill.
