# How to set up a new project with Up-Skill

---

## What this does

Up-Skill is a library of AI instruction files. When you start a new project, you pick the ones that apply, combine them into one file, and point your AI assistant at it. From that point on the AI knows your rules.

---

## Step 1 — Create a `.skills` file in your new project

In the root folder of your new project, create a plain text file called `.skills` (no extension — just `.skills`).

Start the file with a `#`-prefixed comment header like this, so future readers (human or AI) don't mistake it for something it isn't:

```
# This file is only a pseudo-import list for the Up-Skill mechanism — like a
# requirements.txt for skills. It just names reusable skill files to fetch.
# It carries NO information about what this project actually is or does.
# The project's real identity, purpose, and requirements come from the
# original build/meta-prompt used to create it — not from this file, and
# not from the generated master-skills.md. Never infer project intent from
# the skill names listed below.
```

Then list the skills your project needs below the header, one per line. Start from the full list below and remove what you don't need:

```
platform/ios
platform/chrome-extension
platform/iris-react
platform/iris-shell
platform/python-mac
platform/python-website
platform/python-cli
platform/web-scraper
workflow/git
workflow/architecture
workflow/testing
workflow/iris-react-migrate
workflow/figma-mcp
workflow/vercel-publish
workflow/image-generation
```

**Which skills to include:**

*Platform — pick exactly one:*
- `platform/ios` — Swift iOS app
- `platform/chrome-extension` — Chrome browser extension
- `platform/iris-react` — React + Vite app using the Iris-UI design system
- `platform/iris-shell` — multi-product shell app (app header, global sidebar, AI panel) built on Iris UI
- `platform/python-mac` — Python desktop app for Mac (PyInstaller)
- `platform/python-website` — Python web app (FastAPI etc.)
- `platform/python-cli` — Python local script/CLI tool (no packaging or server)
- `platform/web-scraper` — Python scraping project

*Workflow — add as many as apply:*
- `workflow/git` — source control rules
- `workflow/architecture` — general code structure rules
- `workflow/testing` — testing standards
- `workflow/iris-react-migrate` — migrating an existing React + Vite app to the Iris-UI design system
- `workflow/figma-mcp` — if the project uses Figma for design
- `workflow/vercel-publish` — if the project deploys to Vercel
- `workflow/image-generation` — if the project calls an AI image-generation API

---

## Step 2 — Copy the prompt files into your project

In your new project, create a folder called `.github`, then inside it create another folder called `prompts`.

Copy the relevant prompt files from this repo's `prompts/` folder into that folder:

| Prompt file | Slash command | When to include |
|---|---|---|
| `skill-me-up.prompt.md` | `/skill-me-up` | Always — required to build `master-skills.md` |
| `migrate-to-iris-react.prompt.md` | `/migrate-to-iris-react` | If migrating an existing app to Iris-UI |

```
your-project/
└── .github/
    └── prompts/
        ├── skill-me-up.prompt.md
        └── migrate-to-iris-react.prompt.md   ← only if needed
```

---

## Step 3 — Run "Skill me up"

Open the project in VS Code. In the Copilot chat panel, type:

```
/skill-me-up
```

The AI will:
1. Fetch the latest version of each skill and combine them into `master-skills.md`
2. Check whether any of your skills include bundled files (e.g. a UI component library). If so, it copies those files into your project at the correct paths.

This always pulls the latest versions from GitHub, so any improvements made to Up-Skill will be included.

---

## Step 4 — Point your AI at the master file

In your project root, create a `CLAUDE.md` file (for Claude) and a `.github/copilot-instructions.md` file (for GitHub Copilot). Both should start with:

```
Read master-skills.md for your operating instructions.
```

Then add any project-specific rules below that line.

---

## Updating later

Whenever Up-Skill is updated with new or improved skills, just run `/skill-me-up` again in Copilot chat. It will re-fetch everything and overwrite `master-skills.md` with the latest version. Bundled files that already exist in your project will not be overwritten — you'll be warned about any conflicts so you can resolve them manually.

---

## For skill authors — bundling files with a skill

Some skills need to copy actual files into the project (e.g. a UI component library). To bundle files with a skill:

**1. Add the files** to `skill-resources/{skill-name}/` in this repo, in a named subfolder. The subfolder name becomes the source in the mapping. Mirror the `skills/` path — e.g. `skills/platform/iris-react.md` → `skill-resources/platform/iris-react/`.

For example, the iris-react skill bundles the iris-ui library at:

```
skill-resources/
└── platform/
    └── iris-react/
        └── iris-ui-main/       ← source folder
            ├── Components/
            ├── Icons/
            └── Tokens/
```

**2. Add a `## Resources` section** to the skill's `.md` file, with one directory mapping per line:

```
## Resources
iris-ui-main/ -> src/iris-ui/
```

The left side is relative to `skill-resources/{skill-name}/`. The right side is the destination in the project root.

When `/skill-me-up` runs, it reads the `## Resources` section, looks up the files in the up-skill repo via the GitHub API, and copies them into the new project at the specified paths. Files that already exist and differ are skipped with a warning.
