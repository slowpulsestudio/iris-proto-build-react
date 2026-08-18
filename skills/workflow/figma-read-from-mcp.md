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
- Hardcoding a colour, spacing value, radius, font size, or component structure instead of pulling it from Figma
- Proceeding by estimating or guessing a value when the MCP tools returned nothing, instead of stopping

---

**Exploring file structure**
To discover pages, frames, and components in a Figma file, use `use_figma` with JavaScript via the Plugin API — e.g. `figma.root.children` to list pages, `page.children` to list frames. Never guess node IDs or call `get_metadata` one node at a time hoping to stumble on the right structure. Never ask the Designer to manually find node IDs or copy URLs from Figma.

**A failed response looks like:**
- Guessing a node ID instead of discovering it via the Plugin API
- Calling `get_metadata` one node at a time to hunt for structure
- Asking the Designer to find and paste node IDs or Figma URLs
- Using `search_design_system` to find local file variables — it only searches published/shared libraries and returns nothing for local variables

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
