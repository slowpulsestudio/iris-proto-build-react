---
name: figma-write-to-canvas
description: Writing a running prototype or coded screens back to the Figma canvas (code to Figma). Read before any use_figma or generate_figma_design write call. Writes are allowed only on pages whose name starts with 🤖; confirm before deleting or modifying canvas nodes.
---

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

**Figma canvas: page scope + destination lock (hard constraint)**
This rule applies ONLY to the code-to-canvas write direction (pushing a running prototype/component INTO Figma via `use_figma` or `generate_figma_design`). It is unrelated to `.figma-url`, which is the read-direction reference file used by `figma-read-from-mcp` for pulling designs INTO code — never conflate the two, and never store this destination in `.figma-url` or any other generically-named file.

You may ONLY create, edit, or delete content on a Figma page whose name starts with the '🤖' prefix. This overrides any node/page referenced in `.figma-url` or elsewhere — if that page does not have the '🤖' prefix, it is off-limits for writes, including temporary/reference-only material.

**Before any `use_figma` or `generate_figma_design` write call, every time:**

1. Check whether `.figma-code-to-canvas-destination` exists in the project root. (Note the explicit name — this file exists ONLY to record the code-to-canvas write target, and must never be confused with or substituted by `.figma-url`.)
   - Exists: read it, extract the page name, confirm it still starts with '🤖'. If yes, use it as the write destination — skip re-asking. If the prefix is gone (page renamed), treat as missing and go to step 2.
   - Missing: go to step 2.
2. Ask the Designer: *"Before I write anything TO Figma (code-to-canvas), what's the destination page URL? It must be a page whose name starts with the 🤖 emoji — that's the only kind of page I'm allowed to write to. (This is separate from the Figma file you gave me for reading designs — this one is only for writing code output into Figma.)"*
3. Resolve the page name for the given URL/node (e.g. `get_metadata` or a lightweight `use_figma` read).
   - Name does NOT start with '🤖': tell the Designer to add the prefix, save nothing, do not write anything, and wait for them to confirm it's done before checking again.
   - Name starts with '🤖': save the URL to `.figma-code-to-canvas-destination` (create/overwrite), confirm back with the page's name + a clickable link, then proceed.
4. Re-validate the '🤖' prefix against `.figma-code-to-canvas-destination` before every subsequent write in this project — never rely on a past check.

**Always speak in names and clickable Figma URLs, never bare node IDs** (`https://www.figma.com/design/<fileKey>/<name>?node-id=<id>`) — the Designer can't read or click a raw ID like `844:2951`.

**A failed response looks like:**
- Storing this destination in `.figma-url` or any other ambiguously-named file instead of the explicit `.figma-code-to-canvas-destination`
- Treating `.figma-url`'s page as in-scope for writes without checking its '🤖' prefix
- Writing before asking for the destination page URL
- Creating the '🤖'-prefixed page yourself instead of asking the Designer
- "Temporary"/"rough reference" writes on a non-prefixed page
- Skipping re-validation because a prior check already passed
- Mentioning a bare node ID instead of a clickable named link

This stacks with — does not replace — "Confirm before deleting or modifying anything on the canvas": page scope, the '🤖' prefix, and explicit destructive-edit go-ahead are three independent checks, all required.

---

## References

Read after the destination is resolved and before starting a capture or rebuild:

| File | Contains |
|---|---|
| [references/capture-workflow.md](references/capture-workflow.md) | Which Figma workflow to use, the rough-reference-then-design-system approach (6 steps), the ✅/❌ linkage report, and the capture prompt template |

---

**Verify the Figma MCP connection before relying on it**
Connection is set up once during `/skill-me-up` (Figma's Dev Mode → MCP → Clients → **Get Figma integration** — never manual `mcp.json` edits or "Add MCP Server"). If both `figma-read-from-mcp` and `figma-write-to-canvas` are in use, that setup only happens once. Before doing any Figma MCP work in a session, confirm the connection still works with a real tool call (e.g. `get_metadata` on the file in `.figma-url` or `.figma-code-to-canvas-destination`, whichever is relevant to the direction of work) rather than assuming it from a prior setup.

**A failed response looks like:**
- Giving manual `mcp.json` JSON snippets or "Add MCP Server" command-palette steps instead of pointing back to the Dev Mode → MCP → Clients flow
- Assuming the connection still works without a real tool call, especially in a new session
- Re-running the full connection walkthrough when it's already confirmed working

---

## Direction

Write-to-canvas is code to Figma. Use the `figma-read-from-mcp` skill when the direction is Figma to code.

If the Figma commands are unavailable after MCP setup, report that the Figma skills need to be installed or enabled in the agent. Do not switch to the desktop MCP server or claim that frames were created.
