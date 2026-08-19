# Figma Write to Canvas

This skill adds our project-specific guidance for writing a running prototype to Figma. It is included in the downstream project when the user runs `/skill-me-up`.

Figma's MCP integration supplies the runnable commands. This repository does not install those commands.

---

**Confirm before deleting or modifying anything on the canvas**
A clarifying question from the Designer ("is this the thing you mean?") only confirms which node is being discussed — it is never permission to act on it. Before deleting, detaching, or destructively restructuring any node, state exactly what will be changed and wait for an explicit, unambiguous go-ahead ("yes, delete it" / "go ahead") in a separate reply.

**A failed response looks like:**
- Deleting or modifying a node in the same turn as answering "is this the one?" — treating identification as authorization
- Proceeding with a destructive canvas edit because a reasonable-sounding action was implied, without a separate explicit confirmation
- Assuming a screenshot or verification step counts as approval to then delete the reference

---

**Always link, never use raw node numbers**
When referring to any object on the Figma canvas in a message to the Designer, give a clickable Figma URL (`https://www.figma.com/design/<fileKey>/<name>?node-id=<id>`), never a bare node ID like `844:2951`. Node numbers are meaningless to the Designer and cannot be clicked to verify.

**A failed response looks like:**
- Writing "node 844:2951" or "id 316:44420" in a response instead of a full clickable link
- Making the Designer manually construct or guess the URL from a node ID

---

**Only the page linked in `.figma-url` is in scope**
Read the `.figma-url` file at the project root before any Figma MCP work. The file key and page/node in that URL are the only page in scope for edits. Every other page in the file is off-limits — do not create, delete, or modify anything outside that page, even for temporary reference material.

**A failed response looks like:**
- Creating or editing frames on a page other than the one in `.figma-url`
- Assuming any page in the file is fair game because it shares the same file key
- Not checking `.figma-url` before starting Figma MCP work

---

## Choose a workflow

| Goal | Figma skill |
| --- | --- |
| Put a running local prototype into Figma | No dedicated skill for this exact workflow — trigger Figma's `generate_figma_design` tool ("code to canvas") with a plain-language prompt, e.g. "Start a local server for my app and capture the UI in this Figma file: `<URL>`" |
| Put coded screens and tokens into Figma | `/figma-generate-design` and `/figma-generate-library` |
| Explore a design direction from a problem statement | `/figma-use` |

`figma-generate-design`, `figma-generate-library`, and `figma-use` are real Figma-provided skills — this repo does not install them. They ship automatically via the Figma plugin in supported clients (Claude Code, Cursor, VS Code, etc.) once the remote MCP server is connected, or can be downloaded manually from Figma's `mcp-server-guide` repo on GitHub if a client doesn't support plugins. If one is missing, that's a client/environment setup issue — report it as such rather than inventing a substitute command.

## Default approach: rough reference, then design system

Before starting any capture, state the plan to the Designer in one short sentence, e.g.:

> "First I'll do a rough version for reference, then I'll link up the Iris design system components and tokens. We can then refine after, issue by issue."

Then follow these steps, in order:

1. **Capture a rough reference** — prompt Figma's `generate_figma_design` tool in plain language to capture the running prototype pixel-for-pixel (e.g. "Start a local server for my app and capture the UI in this Figma file: `<URL>`"). This is raw DOM/CSS, disconnected from the design system, and exists only as a temporary visual reference.
2. **Look for an existing screen to clone** — before building anything from scratch, search the target Figma file/page for a screen that's already structurally close to the target. Cloning and adapting real, already-composed component instances (auto-layout, bound variables) is far more reliable than assembling one from `search_design_system` results component-by-component.
3. **Rebuild using the Iris design system** — always real Iris UI components and Iris UI Variables (tokens), never disconnected colours, shapes, or hardcoded text styling. Detach nested instances only where a structural change is required (column reorder, re-parenting children) — Figma blocks structural edits on instance descendants.
4. **Refine one section at a time** — screenshot after each section (header, table, action bar, etc.) before moving to the next, and fix issues one at a time rather than making sweeping changes across the whole screen at once.
5. **Deep-review design system linkage** — after wiring up the attempted components and tokens for a section, audit every element individually: confirm it is a real bound instance of an Iris UI Kit component (not a plain frame/rectangle/text node styled to merely look like one), and confirm every style value (color, spacing, radius, typography, elevation, etc.) is bound to an actual Figma variable/token, not a raw hardcoded value that happens to visually match. Produce a full report listing every component and token checked, marked with a tick (✅) for anything successfully linked/bound and a cross (❌) for anything that could not be matched — for each ❌, state plainly what stand-in was used instead and that a matching component/token could not be found. Present this report to the Designer and ask them to point to the correct component or token for each ❌ item.
6. **Delete the rough reference only once the rebuild is verified** — and only with the Designer's explicit confirmation (see "Confirm before deleting or modifying anything on the canvas" above).

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
- The target Figma file URL
- The screens, components, and token constraints to follow

Example:

```text
Start a local server for my app and capture the UI at http://localhost:5173 into this Figma file:
<Figma file URL>

Include every unique screen. Use the existing design-system components and map
the project's tokens where possible.
```

The result is a starting point for review. Refine spacing, layout, and visual decisions directly in Figma rather than repeatedly re-running the skill.

---

**Verify the Figma MCP connection before relying on it**
Connection is set up once during `/skill-me-up` (Figma's Dev Mode → MCP → Clients → **Get Figma integration** — never manual `mcp.json` edits or "Add MCP Server"). If both `figma-read-from-mcp` and `figma-write-to-canvas` are in use, that setup only happens once. Before doing any Figma MCP work in a session, confirm the connection still works with a real tool call (e.g. `get_metadata` on the file in `.figma-url`) rather than assuming it from a prior setup.

**A failed response looks like:**
- Giving manual `mcp.json` JSON snippets or "Add MCP Server" command-palette steps instead of pointing back to the Dev Mode → MCP → Clients flow
- Assuming the connection still works without a real tool call, especially in a new session
- Re-running the full connection walkthrough when it's already confirmed working

---

## Direction

Write-to-canvas is code to Figma. Use the `figma-read-from-mcp` skill when the direction is Figma to code.

If the Figma commands are unavailable after MCP setup, report that the Figma skills need to be installed or enabled in the agent. Do not switch to the desktop MCP server or claim that frames were created.
