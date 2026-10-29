---
name: figma-read-from-mcp
description: Building or reading screens, components, and tokens from a Figma file via the remote Figma MCP (Figma to code). Read before any Figma MCP read or when implementing a design. Figma MCP is the only source of truth for design values; never use Code Connect. Also holds the Iris UI design-style rules (tokens over hardcoded values, Iris components, type and elevation, themes, accessibility) — read before styling any screen or component.
---

# Figma MCP Rules

---

**Verify the Figma MCP connection before relying on it**
Connection is set up once during `/skill-me-up` (Figma's Dev Mode → MCP → Clients → **Get Figma integration** — never manual `mcp.json` edits or "Add MCP Server"). If both `figma-read-from-mcp` and `figma-write-to-canvas` are in use, that setup only happens once. Before doing any Figma MCP work in a session, confirm the connection still works with a real tool call (e.g. `get_metadata` on the file in `.figma-url`) rather than assuming it from a prior setup.

**A failed response looks like:**
- Giving manual `mcp.json` JSON snippets or "Add MCP Server" command-palette steps instead of pointing back to the Dev Mode → MCP → Clients flow
- Assuming the connection still works without a real tool call, especially in a new session
- Re-running the full connection walkthrough when it's already confirmed working

---

**Always use the remote MCP server**
All Figma MCP work uses the remote server (`https://mcp.figma.com/mcp`). Never use the desktop MCP server. The desktop app does not need to be open.

**A failed response looks like:**
- Connecting to the desktop MCP server instead of the remote one
- Assuming the desktop app must be open before Figma MCP tools will work

---

**Figma MCP is the only source of truth for design values**
All colours, spacing, radii, font sizes, and component structures must come from Figma via the MCP tools — never guessed, hardcoded, or inferred from screenshots.

**A failed response looks like:**
- Opening the Figma link in a browser tab, or using `get_screenshot`, instead of the `get_metadata` / `get_design_context` / `get_variable_defs` MCP tools
- Treating a blocked or login-walled browser tab as proof that Figma access is broken — the MCP tools are what matter, not the browser
- Proceeding by estimating or guessing a value when the MCP tools returned nothing, instead of stopping

---

**Tokens over hardcoded values — always**
Every colour, spacing, size, radius, shadow, and type value has an Iris UI token. Use it — check [references/tokens.md](references/tokens.md) rather than guessing a token name. Prefer semantic tokens (`--oi-background-color-*`, `--oi-content-color-*`, `--oi-border-color-*`, `--oi-base-color-*`) over global primitives (`--oi-color-grey-900`); use the global palette only when no semantic mapping exists. Use component tokens (e.g. `--oi-button-background-primary-hover`) for component states.

**A failed response looks like:**
- A raw hex, px, or shadow value that "visually matches" a token
- Using `--oi-color-grey-100` where `--oi-background-color-secondary` exists
- Hardcoding a component's hover/active colour instead of its component token

---

**Use Iris components — never rebuild them**
Buttons, tables, modals, inputs, badges, banners, etc. already exist as Iris components. Use them and configure via their props; only build a new one when Iris genuinely lacks it, and then style it entirely with Iris tokens. Check the source default before assuming a variant (e.g. a Button with no variant may be primary).

**A failed response looks like:**
- A styled `div` that looks like a Button instead of the real component
- Building a new component without first checking the existing Iris components
- Assuming the default variant matches the design without checking

---

**Type and elevation through tokens**
Text uses Iris type tokens (font family, size, line height, weight, letter spacing) — Inter for UI, IBM Plex Mono for code. Elevation uses `--oi-shadow-{none,low,mid,high}`, which carry the correct values for every theme: `none` for canvas/background, `low` for main content, `mid` for dropdowns/menus/tooltips, `high` for side sheets/modals/popovers/toasts.

**A failed response looks like:**
- Setting font size, line height, or letter spacing as raw values
- Writing a raw `box-shadow` instead of an `--oi-shadow-*` token
- Using `--oi-shadow-low` on a modal

---

**Themes come from tokens, not duplicates**
Light, dark, and high-contrast are theme modes — the same semantic token resolves differently per theme. Reference semantic tokens and let the active theme resolve them.

**A failed response looks like:**
- Building a separate dark version of a screen or component
- A value that only works in one theme (e.g. a hardcoded white background)
- Checking a screen in light mode only

---

**Accessibility is a gate, not a nicety**
Default themes target WCAG 2.2 AA; high-contrast themes target all levels (2.0 + 2.1 + 2.2, A/AA/AAA). Check contrast in every shipped theme, visible focus on every interactive element, target sizes at or above the `--oi-size-*` component defaults, and that status meaning isn't carried by colour alone. Flag any requested visual that would break AA instead of silently applying it. Details in [references/accessibility.md](references/accessibility.md).

**A failed response looks like:**
- Overriding a component's tokenised colours with raw values (silently breaks contrast guarantees)
- Removing or hiding a focus style
- Status shown by colour only, with no icon or text

---

**Library source order (global + vertical)**
When selecting component or token references, always use both global Iris libraries and the selected product vertical library.

Source of truth for links:
- `skill-resources/platform/poc-iris-react/poc-iris-react-main/src/lib/verticals.ts`
- Read `IRIS_GLOBAL_LIBRARIES` for global libraries
- Read the active vertical's `subLibraryUrl` for product-specific additions

Resolution order:
1. Vertical library (`subLibraryUrl`) for product-specific patterns
2. Global libraries (`IRIS_GLOBAL_LIBRARIES`) for shared components, icons, variables, charts
3. The working design file (`.figma-url`) for final screen-level truth

If a required vertical `subLibraryUrl` is empty, stop and ask the user for that product's library link instead of guessing.

**A failed response looks like:**
- Using only global libraries and ignoring the active vertical's library
- Treating vertical libraries as replacements for global libraries instead of additive
- Proceeding when a required library URL is missing

---

**Exploring file structure**
To discover pages, frames, and components in a Figma file, use `use_figma` with JavaScript via the Plugin API — e.g. `figma.root.children` to list pages, `page.children` to list frames. Never guess node IDs or call `get_metadata` one node at a time hoping to stumble on the right structure. Never ask the Designer to manually find node IDs or copy URLs from Figma.

**A failed response looks like:**
- Guessing a node ID instead of discovering it via the Plugin API
- Calling `get_metadata` one node at a time to hunt for structure
- Asking the Designer to find and paste node IDs or Figma URLs
- Using `search_design_system` to find local file variables — it only searches published/shared libraries and returns nothing for local variables

---

**Never offer or set up Figma Code Connect**
These are prototypes — visual "close enough" fidelity to the design is the goal, not a maintained code-to-component mapping. Never ask the Designer whether they'd like to connect code components to the Figma design, and never call Code Connect tools (`get_code_connect_map`, `get_code_connect_suggestions`, `add_code_connect_map`, `send_code_connect_mappings`).

**A failed response looks like:**
- Asking "Would you like to connect code components to the Figma design?" or similar
- Calling any Code Connect MCP tool unprompted
- Treating Code Connect as a prerequisite before building or reading a screen

---

**Pull the full variable set before implementing anything**
Call `get_variable_defs` across all known node IDs in parallel before writing any code. Never pull from just one convenient node and stop.

**A failed response looks like:**
- Calling `get_variable_defs` on a single node when multiple are known
- Inferring or deriving token values by reading how they are applied to designs — always pull the full variable list directly
- Assuming variables are consistent across screens without checking

---

**Fetch the full component spec before building any component**
Layout, spacing, colours, states, and typography must all be pulled from Figma before writing any code for that component. Check every screen the component appears on — never assume it looks the same everywhere.

**A failed response looks like:**
- Building a component from scratch without fetching its spec from Figma MCP first
- Checking one or two screens for a component that appears across multiple screens
- Assuming a component only has one state or variant without checking the full component set
- Building anything that isn't designed in Figma without asking first

---

**Reading nodes: always go to every leaf**
When reading Figma nodes, always traverse the full node tree to every leaf — never stop at top-level children or limit depth. Shallow reads produce wrong data and wrong findings. Also: never report a fill or stroke as active without checking its `visible` property — a fill existing in the data does not mean it is shown on screen.

**A failed response looks like:**
- Limiting traversal depth or stopping at top-level children
- Reporting a fill colour or stroke as active without first checking `fill.visible` / `stroke.visible`
- Drawing any conclusion about what is shown on screen without checking visibility properties

---

**Sizing modes: interpret before reporting**
Before reporting a node's `width` or `height` as a fixed value, check its sizing mode (`layoutSizingHorizontal` / `layoutSizingVertical` for children inside auto-layout; `primaryAxisSizingMode` / `counterAxisSizingMode` for auto-layout frames themselves).

- **FIXED** → the number is real — report it and use it in code as a fixed size
- **FILL** → say "stretches to fill its parent" — do not report the pixel number; in code this becomes a flexible/stretching layout, not a hardcoded frame size
- **HUG / AUTO** → say "sized to fit its content" — the number may be mentioned as the current content-driven result only, never as a fixed constraint

**A failed response looks like:**
- Reporting a pixel number as a fixed design value without first checking the sizing mode
- Hardcoding a FILL node's width or height in code instead of making it flexible
- Treating a HUG/AUTO dimension as a fixed constraint

---

**Design tokens stay in sync**
`tokens.css` and `DesignTokens.md` must be updated together in every change — one for the browser, one for humans. They are always identical in content.

**A failed response looks like:**
- Updating `tokens.css` without also updating `DesignTokens.md`
- Documenting a design token value without verifying it against Figma MCP first

---

**Post-build checklist**
After building any screen from a connected Figma file — brand-new or an update — and before calling it done, read [references/post-build-checklist.md](references/post-build-checklist.md) and run every step in it.

## References

| File | Contains |
|---|---|
| [references/post-build-checklist.md](references/post-build-checklist.md) | Build, ✅/❌ component/token review table, localhost screenshot comparison, and commit/push confirmation steps |
| [references/tokens.md](references/tokens.md) | Iris UI semantic colour, spacing, size, radius, and component tokens; theming. Read when picking a token |
| [references/foundations.md](references/foundations.md) | Type scale (spec ↔ code token names), spacing/sizing scales, elevation, icons, breakpoints |
| [references/accessibility.md](references/accessibility.md) | WCAG targets per theme and what to verify. Read when validating any screen or component |
