# How to set up a new project with Up-Skill

---

## What this does

Up-Skill is a library of AI instruction files. When you start a new project, you pick the ones that apply, combine them into one file, and point your AI assistant at it. From that point on the AI knows your rules.

---

## Step 1 — Copy the `.github/` folder into your project

Copy the entire `.github/` folder from this repo into the root of your new project. It contains all the prompt files already in the right place:

Only include `migrate-to-iris-react.prompt.md` if you need to move from one platform to iris-react — otherwise delete it after copying.

---

## Step 2 — Run "Skill me up"

Open the project in VS Code. In the Copilot chat panel, type:

```
/skill-me-up
```

This always pulls the latest versions from GitHub, so any improvements made to Up-Skill will be included.

---

## Step 3 — Question time

The AI will ask you these questions in order:
1. Which platform this project uses
2. Which workflow skills apply
3. Follow-up questions for specific skills:
   - **`platform/iris-shell`** — which product loads by default (Active Roles, On-Demand Services, Identity Manager, or Safeguard)
   - **`workflow/git`** — GitHub repo URL
   - **`workflow/figma-mcp`** — Figma file URL
   - **`workflow/image-generation`** — which image generation provider

**Platform — pick one:**

```
platform/ios
platform/chrome-extension
platform/iris-react
platform/iris-shell
platform/python-mac
platform/python-website
platform/python-cli
platform/web-scraper
```

**Workflow — `workflow/general` is always included. Add as many others as apply:**

```
workflow/general
workflow/git
workflow/architecture
workflow/testing
workflow/iris-react-migrate
workflow/figma-mcp
workflow/vercel-publish
workflow/vercel-password
workflow/image-generation
```

| Skill | When to include |
|---|---|
| `platform/ios` | Swift iOS app |
| `platform/chrome-extension` | Chrome browser extension |
| `platform/iris-react` | React + Vite app using the Iris-UI design system |
| `platform/iris-shell` | Multi-product shell app built on Iris UI |
| `platform/python-mac` | Python desktop app for Mac |
| `platform/python-website` | Python web app (FastAPI etc.) |
| `platform/python-cli` | Python local script/CLI tool |
| `platform/web-scraper` | Python scraping project |
| `workflow/general` | Core execution rules — always include |
| `workflow/git` | Source control rules |
| `workflow/architecture` | General code structure rules |
| `workflow/testing` | Testing standards |
| `workflow/iris-react-migrate` | Migrating an existing app to Iris-UI |
| `workflow/figma-mcp` | If the project uses Figma for design |
| `workflow/vercel-publish` | If the project deploys to Vercel |
| `workflow/vercel-password` | Password gate for Vercel preview deployments |
| `workflow/image-generation` | If the project calls an AI image-generation API |

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
