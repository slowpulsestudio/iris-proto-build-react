# How to set up a new project with Up-Skill

## What this does

Up-Skill is a library of AI instruction files. When you start a new project, you pick the ones that apply, combine them into one file, and point your AI assistant at it. From that point on the AI knows your rules.

---

## Step 1 — Get the prompt file into your project

1. Open your new project folder in VS Code.
2. Open the Copilot Chat panel.
3. Paste this message and send it:

```
   > Fetch `https://raw.githubusercontent.com/slowpulsestudio/iris-proto-build-react/main/.github/prompts/skill-me-up.prompt.md` and save it to `.github/prompts/skill-me-up.prompt.md` in this project.
```

---

## Step 2 — Run "Skill me up"

In the Copilot chat panel, type:

```
/skill-me-up
```

This always pulls the latest versions from GitHub, so any improvements made to Up-Skill will be included.

---

## Step 3 — Question time

The AI will ask you these questions in order:
1. What the prototype is called
2. A brief description of what you're testing or the wider context
3. Which platform this project uses
4. Which workflow skills apply
5. Follow-up questions for specific skills:
   - **`workflow/git`** — GitHub repo URL
   - **`workflow/figma-read-from-mcp`** or **`workflow/figma-write-to-canvas`** — Figma file URL

**Platform — pick one:**

```
platform/iris-react
platform/iris-react-with-shell
```

**Workflow — `workflow/general` is always included. Add as many others as apply:**

```
workflow/general
workflow/architecture
workflow/deep-linking
workflow/figma-read-from-mcp
workflow/figma-write-to-canvas
workflow/git
workflow/testing
workflow/vercel-publish
workflow/migrate-non-iris-to-iris
workflow/vercel-password
```

| Skill | When to include |
|---|---|
| `platform/iris-react` | React + Vite app using the Iris-UI design system |
| `platform/iris-react-with-shell` | Iris UI with app shell, global sidebar, and navigation |
| `workflow/general` | Core execution rules — always include |
| `workflow/architecture` | General code structure rules |
| `workflow/deep-linking` | URL-addressable tree navigation |
| `workflow/figma-read-from-mcp` | If the project uses Figma for design |
| `workflow/figma-write-to-canvas` | Writing design frames to Figma canvas from code |
| `workflow/git` | Source control rules |
| `workflow/testing` | Testing standards |
| `workflow/vercel-publish` | If the project deploys to Vercel |
| `workflow/migrate-non-iris-to-iris` | Migrating a non-Iris app to Iris-UI |
| `workflow/vercel-password` | Password gate for Vercel preview deployments |

The write-to-canvas skill documents workflows provided by Figma's MCP server.
Install the Figma MCP plugin for the agent, or download the skills from the
[Figma MCP skills repository](https://github.com/figma/mcp-server-guide/tree/main/skills).
This Up-Skill repository provides project guidance but does not install those
Figma skills or create their slash commands.

---

## Done

The agent will now:
1. Fetch the latest version of each skill and combine them into `master-skills.md`
2. Copy any bundled files into the project (e.g. a UI component library)
3. Create `.github/copilot-instructions.md` and `CLAUDE.md`

That's it. The AI will have created `master-skills.md`, `.github/copilot-instructions.md`, and `CLAUDE.md` automatically.

---

## Updating later

Whenever Up-Skill is updated with new or improved skills, just run `/skill-me-up` again in Copilot chat. It will re-fetch everything and overwrite `master-skills.md` with the latest version. Bundled files that already exist in your project will not be overwritten — you'll be warned about any conflicts so you can resolve them manually.

---

For skill authors, see [how-to-create-skills.md](how-to-create-skills.md).
