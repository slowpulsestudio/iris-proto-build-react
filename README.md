# AI Prototyping Skills

When you want to transform your Figma design into a fully interactive code prototype using Iris UI and/or pull a prototype back into Figma. keeping your components and tokens intact - use this setup wizard to get your design built, published and ready to refine, share, and user-test.

This repository contains a reusable library of AI prototyping instruction files ("skills") and a wizard to get your prototype set up.

It is the recommended approach for UX Research at One Identity as this prototype framework has been optimised for UX Tweak and our UX Research strategy.


## The Problem This Repo Solves

Copilot agents by default are lazy and incompetent prototype builders - they need a whole load of guardrails and explicit instruction to act more like a human Senior Frontend Developer. This skills repo does just that.


## Purpose

This is for quick turnaround, hi-fidelity, fully interaction prototyping for research purposes.


## How It Works

The skills in this repository are the **source of truth** for AI vibe prototyping guidance. They are designed to be maintained once and reused everywhere.

Instead of one huge instruction file, each project gets three levels of progressive disclosure, so the agent only reads what the current task needs:

| Level | What | Loaded |
|---|---|---|
| 1 | `master-skills.md` — the always-on core rules (`workflow/general`) plus an index of installed skills, each with a one-line "read when" trigger | Every session |
| 2 | `.agents/skills/{name}/SKILL.md` — the rules for one skill | When the task matches that skill's trigger |
| 3 | `.agents/skills/{name}/references/*` — long procedures, code templates, and checklists | Only when a `SKILL.md` links to one for the step being performed |

Hard stops that must never depend on a skill being triggered (for example "never push without confirmation") are written into each skill's trigger description, so they sit in the level 1 index.

This pulls components and tokens directly from the Iris Figma libraries, the specific product master libraries, but also the actual code from the `poc-iris-react` repo where it exists.

Eventually this will automatically refresh with the latest Iris code but for now Ryan manually updates the Iris files. If something you really need from Iris UI is missing, get in touch: `ryan.harte@oneidentity.com`.


## Setup Steps

0. Setup your project

Create a fresh Github repo, create a new folder on your computer and open that folder in VSCode

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
* Shared guidance lives in this repository in one place.
* Projects contain only project-specific context.
* AI agents load a small always-on index and pull in skills and references only when needed.

## Instruction Files

The agent generates `AGENTS.md` pointing at the generated `master-skills.md` file, and a `CLAUDE.md` that imports `AGENTS.md` — this keeps Copilot and Claude Code reading the same shared instructions. It also points the `prototype-specific-agent-instructions.md` which you can specific instructions in.

The AI starts from `master-skills.md` and loads individual skills from `.agents/skills/` as tasks require.

## This Repository Structure

```text
skills/
    platform/
        poc-iris-react/
            SKILL.md
            references/
    workflow/
        general/            ← always included; its SKILL.md is inlined into master-skills.md
            SKILL.md
            references/
        architecture/
            SKILL.md
        figma-write-to-canvas/
            SKILL.md        ← level 2: rules and trigger
            references/     ← level 3: detailed procedures, loaded on demand
        ...                 ← one folder per skill: motion, testing, git, figma-read-from-mcp,
                              figma-update-existing-screen, deep-linking, vercel-publish,
                              vercel-password, microsoft, migrate-non-iris-to-iris
```

Each skill folder must cover **one topic only** and remain reusable across projects. A `SKILL.md` needs `name` and `description` frontmatter; the description is a trigger ("Read when…") and is copied verbatim into the `master-skills.md` index. Keep `SKILL.md` short and move long procedures, code templates, and checklists into `references/` with a link and a note on when to read each one.


---



# Appendix


## Generated Project Structure

After running `/skill-me-up`, a downstream consumer project will contain the following files:

| File | What it's for |
|---|---|
| `.github/prompts/skill-me-up.prompt.md` | The setup prompt itself, fetched in Step 1 and self-updating on every run |
| `.skills` | Pseudo-import list of the skill names selected for this project |
| `.skill-answers` | Stores answers to setup questions so reruns don't re-ask them |
| `.figma-url` | The project's Figma file URL, if a Figma workflow skill was selected — read-direction reference only |
| `.figma-code-to-canvas-destination` | The '🤖'-prefixed Figma page URL locked in as the code-to-canvas write destination, if `figma-write-to-canvas` is in use — never the same file as `.figma-url` |
| `master-skills.md` | Generated level 1 file — the always-on core rules plus an index of installed skills and when to read each. Rebuilt on every run; never edit it |
| `.agents/skills/{name}/` | Level 2 and 3 — each selected skill's `SKILL.md` and `references/`, overwritten from this repo on every run |
| `example-prompts.md` | Example prompts and direction to give the agent, refreshed from this repo on every run |
| `.github/copilot-instructions.md` | No longer generated for new projects as of version 25 — Copilot reads `AGENTS.md` directly. Existing projects keep this file (never overwritten) |
| `AGENTS.md` | Points Copilot and Claude Code at `master-skills.md` and `prototype-specific-agent-instructions.md` — the shared, harness-agnostic instruction pointer |
| `CLAUDE.md` | Imports `AGENTS.md` (`@AGENTS.md`), so Claude Code reads the same shared file even in sessions that only read `CLAUDE.md` by default |
| `prototype-specific-agent-instructions.md` | Project-specific instructions (design decisions, constraints, known issues) — never overwritten by `/skill-me-up` |
| `README.md` | Created only if it doesn't already exist (checked on every run, including reruns) — shows the prototype name, description, Figma link, this repo as the upstream generator, and the skills used to assemble `master-skills.md` and `.agents/skills/`. Never overwritten once it exists |
| bundled skill resources (e.g. `src/iris-shell/`) | Files copied in from `skill-resources/` for skills that bundle a library or template, per each skill's `## Resources` mapping |


## Setup Questions Reference

Every fixed-choice question below is asked with real clickable buttons, never a plain-text list to type back. Answers are stored as `key = value` pairs in `.skill-answers` so reruns don't re-ask — remove a line from that file to force a question to be asked again.

| `.skill-answers` key | Question | Asked when |
|---|---|---|
| *(none — prompt self-update)* | "There are updates available for the skill-me-up prompt. Would you like me to update it now?" | Every run, only if a newer `skill-me-up.prompt.md` version exists upstream |
| `project-name` | "What is the name of this prototype?" | First-time setup (free text) |
| `project-description` | "In a sentence or two, describe what you're trying to test…" | First-time setup (free text) |
| `workflow-skills` | Multi-select checkbox list of optional skills | First-time setup |
| `git-remote` | "What is the GitHub repo URL for this project?" | `workflow/git` selected and no git remote configured yet |
| `figma-url` / `figma-stale` / `figma-none` | "What is the Figma file URL for this project?" with an *"I'll paste it later"* button, a *"This Figma is stale (I vibe-coded it / used Figma Make)"* button, and a *"There is no Figma, we are migrating an existing site/prototype/app"* button | `workflow/figma-read-from-mcp` or `workflow/figma-write-to-canvas` selected |
| `shell-product` / `shell-mode` | "What product is your prototype for?" (flat list of product names, no shell/standalone grouping), followed by a Yes/No confirmation of the inferred shell mode with the default pre-selected | `platform/poc-iris-react` active (always, since it's mandatory) |
| `shell-page` | "Where should we build your design? In an existing left-navigation page, or a new one?" | `shell-mode = shell` |
| *(none — commit/push)* | "Would you like me to commit and push these changes to GitHub?" | `workflow/git` active and files were changed/created this run |
| `vercel-setup` | "Would you like me to walk you through setting up auto-publish from your GitHub repo to Vercel?" | `workflow/vercel-publish` active and not already connected |
| `figma-build-mode` | "When we build this screen, should we create a new screen from scratch, or update an existing screen from the `poc-iris-react` base?" | `platform/poc-iris-react` + a Figma workflow skill active + `.figma-url` exists |
| `figma-build-prompted` | "You've got a Figma file connected — want me to start building out the design from it now?" | Same as above |
| `migrate-prompted` | "Do you want to migrate the current project to the Iris prototype platform now?" | `workflow/migrate-non-iris-to-iris` active |


## Skills Catalogue

The Iris Shell foundation is included by default in every generated project.

The `poc-iris-react` baseline is manually updated by Ryan from Abhi's shell repo: `https://github.com/oi-eng/poc-iris-react`.

| Skill | When to include |
|---|---|
| `workflow/general` | Core execution rules — always include |
| `workflow/architecture` | General code structure rules |
| `workflow/deep-linking` | URL-addressable tree navigation |
| `workflow/figma-read-from-mcp` | If the project uses Figma for design. Automatically gathers your products master library. Includes Iris UI design-style rules (tokens, elevation, themes, accessibility). |
| `workflow/figma-write-to-canvas` | Writing design frames to Figma canvas from code |
| `workflow/figma-update-existing-screen` | Audit-first flow for updating existing `poc-iris-react` screens one discrepancy at a time |
| `workflow/git` | Source control rules |
| `workflow/motion` | Motion principles, token usage, and reduced-motion requirements |
| `workflow/testing` | Testing standards |
| `workflow/microsoft` | Windows and PowerShell-safe execution guidance |
| `workflow/migrate-non-iris-to-iris` | Migrating a non-Iris app to Iris-UI |
| `workflow/vercel-publish` | If the project deploys to Vercel |
| `workflow/vercel-password` | Password gate for Vercel preview deployments |

The write-to-canvas skill documents workflows provided by Figma's MCP server.
Install the Figma MCP plugin for the agent, or download the skills from the
[Figma MCP skills repository](https://github.com/figma/mcp-server-guide/tree/main/skills).
This Up-Skill repository provides project guidance but does not install those
Figma skills or create their slash commands.


---
