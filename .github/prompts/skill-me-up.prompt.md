---
mode: agent
description: Rebuild master-skills.md by fetching the latest skill files from the up-skill repo on GitHub, and copy any skill-bundled files into this project.
---

## Step 0 — Skills setup

Check whether a `.skills` file exists in the root of this project.

**If `.skills` exists:** read it. It contains a list of skill names, one per line. Skip blank lines and any line starting with `#`.

**If `.skills` does not exist:** ask the user the following questions one at a time, waiting for an answer before asking the next:

1. *"What is the GitHub repo URL for this project?"* (used for git setup below — skip if they say they don't need it)

2. *"Which platform does this project use? Pick one:"*
   - `platform/ios` — Swift iOS app
   - `platform/chrome-extension` — Chrome browser extension
   - `platform/iris-react` — React + Vite app using the Iris-UI design system
   - `platform/iris-shell` — multi-product shell app built on Iris UI
   - `platform/python-mac` — Python desktop app for Mac
   - `platform/python-website` — Python web app (FastAPI etc.)
   - `platform/python-cli` — Python local script/CLI tool
   - `platform/web-scraper` — Python scraping project

3. *"`workflow/general` is always included. Which of these workflow skills also apply? Pick as many as needed:"*
   - `workflow/git` — source control rules
   - `workflow/architecture` — general code structure rules
   - `workflow/testing` — testing standards
   - `workflow/iris-react-migrate` — migrating an existing app to Iris-UI
   - `workflow/figma-mcp` — if the project uses Figma
   - `workflow/vercel-publish` — if the project deploys to Vercel
   - `workflow/vercel-password` — password gate for Vercel preview deployments
   - `workflow/image-generation` — if the project calls an AI image-generation API

   Once all three questions are answered, write the `.skills` file with the standard comment header followed by the chosen skills, one per line. Always include `workflow/general` as the first workflow entry:

   ```
   # This file is only a pseudo-import list for the Up-Skill mechanism — like a
   # requirements.txt for skills. It just names reusable skill files to fetch.
   # It carries NO information about what this project actually is or does.
   # The project's real identity, purpose, and requirements come from the
   # original build/meta-prompt used to create it — not from this file, and
   # not from the generated master-skills.md. Never infer project intent from
   # the skill names listed below.
   ```

Do not proceed to Step 1 until the `.skills` file exists and the skill list is confirmed.

## Step 0b — Git setup (if applicable)

If `workflow/git` is in the skills list, check whether a git remote is already configured by running `git remote get-url origin`.

- If a remote **is already set**, skip this step entirely.
- If **no remote is set** and a repo URL was provided in Step 0, then:
  1. Run `git init` if the folder is not already a git repository
  2. Run `git remote add origin {url}`
  3. Confirm the remote was set successfully before continuing
- If **no remote is set** and no URL was provided, ask: *"What is the GitHub repo URL for this project?"* then follow the steps above.

Do not proceed to the next step until this is resolved.

## Step 1 — Rebuild master-skills.md

For each skill name, fetch the corresponding skill file from GitHub using this URL pattern:

```
https://raw.githubusercontent.com/slowpulsestudio/up-skill/main/skills/{skill-name}.md
```

Fetch all skills in parallel. Then concatenate them in the order they appear in `.skills`, with a blank line between each, and write the result to `master-skills.md` in the project root, overwriting whatever was there before.

## Step 2 — Copy skill-bundled files

After fetching each skill file, scan it for a `## Resources` section. If a skill has no `## Resources` section, skip this step for that skill.

The `## Resources` section contains directory copy mappings, one per line, in the format:

```
source-folder/ -> dest-folder/
```

- `source-folder/` is a path relative to `skill-resources/{skill-name}/` in the up-skill repo
- `dest-folder/` is the destination path relative to this project's root

For each mapping, use the zip download approach:
1. Download the up-skill repo as a zip:
   `https://github.com/slowpulsestudio/up-skill/archive/refs/heads/main.zip`
2. Extract only the files whose path within the zip starts with `up-skill-main/skill-resources/{skill-name}/{source-folder}/`
3. Write each extracted file to `{project-root}/{dest-folder}/{relative-path}`, where `relative-path` is the portion after `up-skill-main/skill-resources/{skill-name}/{source-folder}/`. Create any necessary directories.
4. If a file already exists at the destination and its content differs, warn the user and skip it — do not overwrite.

Download the zip once and reuse it for all resource mappings across all skills.

## Step 3 — Create AI instruction files

Check for the following two files and create them if they don't already exist:

**`.github/copilot-instructions.md`**
```
Read master-skills.md for your operating instructions.
```

**`CLAUDE.md`**
```
Read master-skills.md for your operating instructions.
```

If either file already exists, leave it untouched — do not overwrite or append.

## Step 4 — Report

When done, report:
- Which skills were fetched successfully
- The total line count of the new `master-skills.md`
- Any skills that failed to fetch (404 or network error)
- Which bundled files were copied (grouped by skill), and any that were skipped due to conflicts
- Whether `.github/copilot-instructions.md` and `CLAUDE.md` were created or already existed
