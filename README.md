# AI Skills

This repository contains a reusable library of AI instruction files ("skills") that can be shared across multiple software projects.

## Purpose

The skills in this repository are the **source of truth** for AI coding guidance. They are designed to be maintained once and reused everywhere.

Projects should **not** point AI agents directly at individual skill files. Instead, a build step should combine the required skills into a single `master-skills.md` file that becomes the project's authoritative instruction document.

This approach avoids relying on AI agents to resolve nested imports or follow multiple levels of references, which can produce inconsistent results.

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

## Usage

For each project:

1. Always start with `general.md` — it applies to every project.
2. Select any additional skills from `skills/` that apply.
3. From `skills/platform/`, pick **exactly one**: `iris-react.md` for a standalone Iris UI app, or `iris-react-with-shell.md` if the project needs the app shell (title bar and navigation). Never include more than one platform skill.
4. Concatenate them, in order, into a single `master-skills.md`.
5. Append any project-specific instructions.
6. Point both `CLAUDE.md` and `.github/copilot-instructions.md` at the generated `master-skills.md`.

The AI should consume only the generated file.

## Design Principles

* One responsibility per skill.
* Skills are modular and reusable.
* Shared guidance lives in this repository.
* Projects contain only project-specific context.
* AI agents receive a single, flattened instruction file.
* Never rely on recursive imports or multi-level instruction chains.

## Adding a Skill

When adding a new skill:

* Keep it focused on a single domain.
* Avoid duplicating content from other skills.
* Write clear, atomic rules.
* Use headings and bullet points rather than long prose.
* Assume the skill will be combined with others.

## Updating Skills

Because all projects consume generated instruction files, improvements made here can be propagated to every project simply by rebuilding the project's `master-skills.md`.

This repository is intended to be version-controlled independently and shared across multiple repositories.

## Maintaining This Repository

The `/skill-me-up` prompt and `master-skills.md` build step described above are for **consumer projects** — they are never run inside this repository.

This repo itself is maintained directly: when a gap, mistake, or new pattern is found (in this repo or while working on a consumer project), paste the relevant prompt/context straight into chat here and have the AI update or add the appropriate skill file by hand. There is no build/generation step for `up-skill` itself.

## Future enhancements

- Currently Ryan manually drags iris-react and shell files into the folder periodically so when you run this, it may not be 100% up to date with our Iris-UI-react repo. Eventually on initial load, it will dynamically pull the latest