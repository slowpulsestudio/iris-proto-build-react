# Figma Write to Canvas Rules

Based off this new set of MVP 2 way features: 
https://help.figma.com/hc/en-us/articles/40219873508247-Workflow-lab-Code-to-canvas?utm_campaign=051826+-+Activation+-+Wor&utm_content=051826+-+Activation+-+Wor&utm_medium=email&utm_source=figma

---

**Write to canvas goes code → Figma, not the other way**
The write-to-canvas skills place real design frames onto the Figma canvas from running code. They do not generate code. Use the `figma-mcp` skill for the reverse direction (reading from Figma to implement code).

The remote MCP server (`https://mcp.figma.com/mcp`) is required. The write-to-canvas skills are not available on the desktop MCP server.

---

**Use the right skill for the job**

| Skill | Starting point | What it produces on canvas |
| --- | --- | --- |
| `/prototype-to-figma` | Running local prototype (localhost URL) | Each unique screen as a design frame connected to the design system, plus a summary page and a styles page |
| `/figma-generate-design` + `/figma-generate-library` | Code-based design (e.g. a dark mode built in code) | Screens placed on canvas side-by-side, plus a new variable collection reflecting the tokens used in code |
| `/figma-use` | Problem statement or existing Figma design | A rough direction generated with real production components, ready to refine on canvas |

**A failed response looks like:**
- Using `/figma-use` when the goal is to capture a running prototype — use `/prototype-to-figma` instead
- Using `/prototype-to-figma` when the goal is to explore a new design direction — use `/figma-use` instead
- Running a write-to-canvas skill without the Figma file open and ready to receive frames
- Treating the agent's canvas output as a finished design — it is always a starting point to refine

---

**Include enough context in the prompt**
When calling a write-to-canvas skill, the prompt must include:
- The skill name (e.g. `/prototype-to-figma`)
- The relevant URL or problem statement
- Any constraints (design system components to use, screens to include, tokens to map)

The more specific the prompt, the more accurate the output. A vague prompt produces frames that need more manual correction.

**A failed response looks like:**
- Calling `/prototype-to-figma` without specifying the localhost URL
- Calling `/figma-use` with only "make it better" — include the user research insight or specific problem to solve
- Omitting which design system components or variable collections should be used when multiple exist in the file

---

**Refine on canvas, not by re-prompting**
Once frames are on the canvas, edit them directly in Figma rather than re-running the skill with adjusted instructions. Canvas iteration is faster and produces better results than prompt iteration for visual and layout decisions.

**A failed response looks like:**
- Re-running a write-to-canvas skill to fix a spacing or colour issue that could be corrected directly on canvas
- Treating re-prompting as the default feedback loop for visual refinement

---

**Push tokens back to code after refining variables**
If `/figma-generate-library` was used and variables were edited in Figma, prompt the agent to update the design system tokens in the codebase to match. Figma becomes the source of truth for that token set from that point forward.

**A failed response looks like:**
- Editing variables in Figma and not syncing them back to code
- Updating tokens in code independently after a `/figma-generate-library` run, which would create a divergence
