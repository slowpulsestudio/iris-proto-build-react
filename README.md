# AI Prototyping Skills

This repository contains a reusable library of AI prototyping instruction files ("skills") that can be shared across multiple software projects.

## Purpose

Copilot agents by default are lazy and incompetent prototype builders - they need a whole load of guardrails and explicit instruction to act more like a human Senior Frontend Developer. This skills repo does just that.

The skills in this repository are the **source of truth** for AI vibe prototyping guidance. They are designed to be maintained once and reused everywhere.

Instead of cluttered lists of skills, a single `master-skills.md` file that becomes the project's authoritative instruction document.

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

The agent will ask you a bunch of questions to finish the setup and you are done. Depending on what skills you choose, different questions will follow. For more details on each skill, scroll down to the bottom of this document.

4. Prototype refinement

Now your prototype is setup, you can use this file for some examples of the kind of questions and direction you can give the agent: `example-prompts.md`.


---



# Detailed Concepts About This Repo

## UX Research considerations

If you really think about UX Research best practise - we don't want auto-refresh of Iris UI git update imports or fancy branching. When we decide to test a specific prototype - we want to stamp the current state in time and store that as a frozen branch for future reference.

## Design Principles

* One responsibility per skill.
* Skills are modular and reusable.
* Shared guidance lives in this repository in one master file
* Projects contain only project-specific context.
* AI agents receive a single, flattened instruction file.

## Instruction Files

The agent points both `CLAUDE.md` and `.github/copilot-instructions.md` at the generated `master-skills.md` file so they remain consistent. It also points the `prototype-specific-agent-instructions.md` which you can specific instructions in.

The AI should consume only the generated file.

## This Repository Structure

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


---



# Extra Details

## Skills Catalogue

| Skill | When to include |
|---|---|
| `platform/iris-react` | React + Vite app using the Iris-UI design system |
| `platform/iris-react-with-shell` | Iris React + app shell, global sidebar, and navigation |
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


## Generated Project Structure

After running `/skill-me-up`, a downstream consumer project will contain the following files:

| File | What it's for |
|---|---|
| `.github/prompts/skill-me-up.prompt.md` | The setup prompt itself, fetched in Step 1 and self-updating on every run |
| `.skills` | Pseudo-import list of the skill names selected for this project |
| `.skill-answers` | Stores answers to setup questions so reruns don't re-ask them |
| `.figma-url` | The project's Figma file URL, if a Figma workflow skill was selected |
| `master-skills.md` | The combined, flattened instruction file assembled from the selected skills — the AI's actual source of truth |
| `example-prompts.md` | Example prompts and direction to give the agent, refreshed from this repo on every run |
| `.github/copilot-instructions.md` | Points Copilot at `master-skills.md` and `prototype-specific-agent-instructions.md` |
| `CLAUDE.md` | Points Claude at `master-skills.md` and `prototype-specific-agent-instructions.md` |
| `prototype-specific-agent-instructions.md` | Project-specific instructions (design decisions, constraints, known issues) — never overwritten by `/skill-me-up` |
| `README.md` | Created only if it doesn't already exist (checked on every run, including reruns) — shows the prototype name, description, Figma link, this repo as the upstream generator, and the skills used to assemble `master-skills.md`. Never overwritten once it exists |
| bundled skill resources (e.g. `src/iris-ui/`, `src/iris-shell/`) | Files copied in from `skill-resources/` for skills that bundle a library or template, per each skill's `## Resources` mapping |