# How to set up a new project with Up-Skill

---

## What this does

Up-Skill is a library of AI instruction files. When you start a new project, you pick the ones that apply, combine them into one file, and point your AI assistant at it. From that point on the AI knows your rules.

---

## Step 1 — Create a `.skills` file in your new project

In the root folder of your new project, create a plain text file called `.skills` (no extension — just `.skills`).

Open it and list the skills your project needs, one per line. For example, an iOS project might look like:

```
git
figma-mcp
project-type/ios
```

**Which skills to include:**
- `git` — baseline rules for source control
- `figma-mcp` — if the project uses Figma for design
- `vercel-prototype` — if the project deploys prototypes to Vercel
- `architecture` — general code structure rules
- `testing` — testing standards

**From `project-type/` — pick exactly one:**
- `ios` — Swift iOS app
- `chrome-extension` — Chrome browser extension
- `python-mac` — Python desktop app for Mac (PyInstaller)
- `python-website` — Python web app (FastAPI etc.)
- `web-scraper` — Python scraping project

---

## Step 2 — Copy the prompt file into your project

In your new project, create a folder called `.github`, then inside it create another folder called `prompts`.

Copy the file `prompts/skill-me-up.prompt.md` from this repo into that folder:

```
your-project/
└── .github/
    └── prompts/
        └── skill-me-up.prompt.md
```

---

## Step 3 — Run "Skill me up"

Open the project in VS Code. In the Copilot chat panel, type:

```
/skill-me-up
```

The AI will fetch the latest version of each skill you listed, combine them into one file, and save it as `master-skills.md` in your project root. This always pulls the latest version from GitHub, so any improvements made to Up-Skill will be included.

---

## Step 4 — Point your AI at the master file

In your project root, create a `CLAUDE.md` file (for Claude) and a `.github/copilot-instructions.md` file (for GitHub Copilot). Both should start with:

```
Read master-skills.md for your operating instructions.
```

Then add any project-specific rules below that line.

---

## Updating later

Whenever Up-Skill is updated with new or improved skills, just run `/skill-me-up` again in Copilot chat. It will re-fetch everything and overwrite `master-skills.md` with the latest version.
