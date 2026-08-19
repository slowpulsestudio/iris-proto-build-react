# AI Skills

This repository contains a reusable library of AI instruction files ("skills") that can be shared across multiple software projects.

## Purpose

The skills in this repository are the **source of truth** for AI coding guidance. They are designed to be maintained once and reused everywhere.

Projects should **not** point AI agents directly at individual skill files. Instead, a build step should combine the required skills into a single `master-skills.md` file that becomes the project's authoritative instruction document.

This approach avoids relying on AI agents to resolve nested imports or follow multiple levels of references, which can produce inconsistent results.

## Setup Steps

1. Fetch the initation prompt

Copy and paste this prompt into your VSCode Copilot using Claude Sonnet 5:

```
   > Fetch `https://raw.githubusercontent.com/slowpulsestudio/iris-proto-build-react/main/.github/prompts/skill-me-up.prompt.md` and save it to `.github/prompts/skill-me-up.prompt.md` in this project.
```

2. Run "Skill me up"

In the same Copilot chat panel run this prompt and the setup steps will commence. It can take 15 mins:

```
/skill-me-up
```

3. Question time

The agent will ask you a bunch of questions to finish the setup and you are done. Depending on what skills you choose, different questions will follow. For more details 

4. Prototype refinement

Now your prototype is setup, you can use this file for some examples of the kind of questions and direction you can give the agent: `example-prompts.md`



# Further Details

## UX Research considerations

If you really think about UX Research best practise - we don't want auto-refresh of Iris UI git update imports or fancy branching. When we decide to test a specific prototype - we want to stamp the current state in time and store that as a frozen branch for future reference.

## Repository Structure

```text
skills/
    workflow/
        general.md          ← always included in every project
        architecture.md
        testing.md
        git.md
        figma-read-from-mcp.md
        figma-write-to-canvas.md
        vercel-publish.md
        vercel-password.md
        migrate-non-iris-to-iris.md
    platform/
        iris-react.md
        iris-react-with-shell.md
```

Each file should cover **one topic only** and remain reusable across projects.

## Instruction Files

The agent points both `CLAUDE.md` and `.github/copilot-instructions.md` at the generated `master-skills.md` file so they remain consistent. It also points the `prototype-specific-agent-instructions.md` which you can specific instructions in.

The AI should consume only the generated file.

## Design Principles

* One responsibility per skill.
* Skills are modular and reusable.
* Shared guidance lives in this repository.
* Projects contain only project-specific context.
* AI agents receive a single, flattened instruction file.
* Never rely on recursive imports or multi-level instruction chains.

## Skills Catalogue

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