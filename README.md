# AI Skills

This repository contains a reusable library of AI instruction files ("skills") that can be shared across multiple software projects.

## Purpose

The skills in this repository are the **source of truth** for AI coding guidance. They are designed to be maintained once and reused everywhere.

Projects should **not** point AI agents directly at individual skill files. Instead, a build step should combine the required skills into a single `master-skills.md` file that becomes the project's authoritative instruction document.

This approach avoids relying on AI agents to resolve nested imports or follow multiple levels of references, which can produce inconsistent results.

## Repository Structure

```text
skills/
    general.md          ← always included in every project
    architecture.md
    testing.md
    git.md
    figma-mcp.md
    iris-ui.md
    vercel-publish.md
    project-type/
        ios.md
        chrome-extension.md
        python-mac.md
        python-website.md
        web-scraper.md
        iris-react.md
```

Each file should cover **one topic only** and remain reusable across projects.

## Usage

For each project:

1. Always start with `general.md` — it applies to every project.
2. Select any additional skills from `skills/` that apply.
3. From `skills/project-type/`, pick **exactly one** to match the project's platform (e.g. `ios.md` for an iOS app, `python-mac.md` for a Mac desktop app). Never include more than one project-type skill.
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
