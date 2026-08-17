---
mode: agent
description: Rebuild master-skills.md by fetching the latest skill files from the up-skill repo on GitHub, and copy any skill-bundled files into this project.
---

## Step -1 — Self-update check

Before doing anything else, fetch the latest version of this prompt from the up-skill repo:

```
https://raw.githubusercontent.com/slowpulsestudio/iris-proto-build-react/main/.github/prompts/skill-me-up.prompt.md
```

Compare it to the current contents of `.github/prompts/skill-me-up.prompt.md` in this project.

- **If they are identical:** continue to Step 0.
- **If they differ:** tell the user: *"There are updates available for the skill-me-up prompt. Would you like me to update it now? You'll need to run `/skill-me-up` again after."*
  - If yes: overwrite `.github/prompts/skill-me-up.prompt.md` with the fetched version and stop. Do not continue setup.
  - If no: continue to Step 0 with the current version.

## Step 0 — Skills setup

Check whether a `.skills` file exists in the root of this project.

**If `.skills` exists:** read it to get the skill list. Then proceed to Answer tracking below — new questions added to the prompt since the project was first set up will be asked now if their key is missing from `.skill-answers`. After resolving any missing answers, skip to Step 0b.

**If `.skills` does not exist:** proceed to the questions below. Do not improvise or skip ahead — follow the steps exactly as written.

### Answer tracking

Before asking any setup questions, check whether `.skill-answers` exists in the project root. If it does, read it — it stores previously given answers as `key = value` pairs, one per line (skip blank lines and lines starting with `#`).

For every question below, check whether its key already exists in `.skill-answers`:

- **Key exists:** skip the question silently. Use the stored value.
- **Key is missing:** ask the question. When answered, add `key = value` to `.skill-answers` (creating the file if it doesn't exist yet).

After all questions are resolved, write any newly collected answers to `.skill-answers`.

### Questions

**`project-name`** — *"What is the name of this prototype?"*

**`project-description`** — *"In a sentence or two, describe what you're trying to test — or add any relevant context (version, goal, background) that will help the AI understand this prototype."*

**`platform`** — *"Does this project need the Iris ecosystem shell — the title bar and navigation?"*

- Yes → `platform/iris-react-with-shell`
- No → `platform/iris-react`

**`workflow-skills`** — *"`workflow/general` is always included. The skills below are pre-selected by default — deselect any that don't apply, and add any others you need:"*

- [on] `workflow/architecture`
- [on] `workflow/deep-linking`
- [on] `workflow/figma-mcp`
- [off] `workflow/figma-write-to-canvas`
- [on] `workflow/git`
- [on] `workflow/testing`
- [on] `workflow/vercel-publish`
- [off] `workflow/migrate-non-iris-to-iris`
- [off] `workflow/vercel-password`

**`default-product`** — only if `platform/iris-react-with-shell` was chosen: *"Which product should load by default when the app opens?"*

- Active Roles / On-Demand Services / Identity Manager / Safeguard

Once confirmed, update the following three files in `src/iris-shell/` to reflect the chosen default:
- `src/lib/router.ts` — set `const DEFAULT` to the correct hash (`#/insights` for Active Roles, `#/services` for On-Demand Services, `#/identity` for Identity Manager, `#/safeguard` for Safeguard)
- `src/lib/verticals.ts` — set `defaultRoute` on the matching vertical record to the same hash
- `src/lib/productMenu.tsx` — ensure the matching product entry is first in the list and its `route` matches

**`git-remote`** — only if `workflow/git` was selected: *"What is the GitHub repo URL for this project?"*

**`figma-url`** — only if `workflow/figma-mcp` or `workflow/figma-write-to-canvas` was selected: *"What is the Figma file URL for this project?"* Give the user two options:
- Paste the URL now — save it to `.figma-url` in the project root
- *"I'll paste it in this chat when I have it"* — reply: *"No problem — paste the Figma URL in this chat whenever you're ready and I'll save it to `.figma-url`."* then continue setup. When the user later pastes a URL starting with `https://www.figma.com/`, write it to `.figma-url`.

Once all questions are resolved, write the `.skills` file if it doesn't exist yet, using the standard comment header followed by the chosen skills, one per line. Always include `workflow/general` as the first workflow entry:

```
# This file is only a pseudo-import list for the Up-Skill mechanism — like a
# requirements.txt for skills. It just names reusable skill files to fetch.
# It carries NO information about what this project actually is or does.
# The project's real identity, purpose, and requirements come from the
# original build/meta-prompt used to create it — not from this file, and
# not from the generated master-skills.md. Never infer project intent from
# the skill names listed below.
```

The `.skill-answers` file should be committed — it's not secret. When a new question is added to this prompt in future, give it a new key and it will be asked on the next run of any project that doesn't have that key yet.

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
https://raw.githubusercontent.com/slowpulsestudio/iris-proto-build-react/main/skills/{skill-name}.md
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
   `https://github.com/slowpulsestudio/iris-proto-build-react/archive/refs/heads/main.zip`
2. Extract only the files whose path within the zip starts with `up-skill-main/skill-resources/{skill-name}/{source-folder}/`
3. Write each extracted file to `{project-root}/{dest-folder}/{relative-path}`, where `relative-path` is the portion after `up-skill-main/skill-resources/{skill-name}/{source-folder}/`. Create any necessary directories.
4. If a file already exists at the destination and its content differs, warn the user and skip it — do not overwrite.

Download the zip once and reuse it for all resource mappings across all skills.

After all files are copied, if `project-name` is known from `.skill-answers`, find `index.html` in the project (check `src/iris-shell/index.html`, `src/iris-ui/index.html`, then the project root) and update the `<title>` tag to the project name. Skip silently if no `index.html` exists.

## Step 3 — Create AI instruction files

Check for the following three files and create them if they don't already exist:

**`.github/copilot-instructions.md`**
```
Read master-skills.md and prototype-specific-agent-instructions.md for your operating instructions.
```

**`CLAUDE.md`**
```
Read master-skills.md and prototype-specific-agent-instructions.md for your operating instructions.
```

**`prototype-specific-agent-instructions.md`**
```
# Prototype-specific agent instructions

Add any instructions here that are specific to this prototype — design decisions, constraints, what you're testing, known issues, personas, etc. This file is never overwritten by /skill-me-up.
```

If any of these files already exist, leave them untouched — do not overwrite or append.

## Step 4 — Report

When done, report:
- Which skills were fetched successfully
- The total line count of the new `master-skills.md`
- Any skills that failed to fetch (404 or network error)
- Which bundled files were copied (grouped by skill), and any that were skipped due to conflicts
- Whether `.github/copilot-instructions.md`, `CLAUDE.md`, and `prototype-specific-agent-instructions.md` were created or already existed

## Step 5 — Post-setup actions (ask in order, only if applicable)

Ask the following questions one at a time, only for the skills that are active. Skip any that aren't.

**If `workflow/git` is active:**
Check whether any files were actually changed or created during this run (e.g. `master-skills.md` was overwritten, new bundled files were copied, or instruction files were created).
- **If files were changed/created:** ask exactly: *"Would you like me to commit and push these changes to GitHub?"* — do NOT say "initial setup"; this may be a rerun.
  - If yes: stage all changed/new files, write a commit message that summarises what changed (e.g. `Update master-skills.md and copy bundled resources`), and push to origin.
- **If nothing changed:** skip — do not ask.
- If no: skip.

**If `workflow/vercel-publish` is active** (ask after the git question is resolved):
Check `.skill-answers` for `vercel-setup`, and whether `.vercel/project.json` exists.

- **If `vercel-setup = done` in `.skill-answers`, OR `.vercel/project.json` exists:** Vercel is already connected — skip this question entirely.
- **If `vercel-setup = no` in `.skill-answers`:** user previously declined — skip this question entirely.
- **Otherwise:** ask: *"Would you like me to walk you through setting up auto-publish from your GitHub repo to Vercel?"*
  - If yes: guide the user through connecting the repo to Vercel via the Vercel dashboard (Import Project → select repo). Once they confirm it's connected, save `vercel-setup = done` to `.skill-answers`.
  - If no: save `vercel-setup = no` to `.skill-answers` and skip.
