---
mode: agent
description: Rebuild master-skills.md by fetching the latest skill files from the up-skill repo on GitHub, and copy any skill-bundled files into this project.
version: 14
---

## Cross-platform execution guardrails

This prompt must run reliably on macOS/Linux shells and Windows PowerShell.

- Prefer VS Code tools for fetch/read/write/copy operations instead of shell one-liners whenever possible.
- If terminal commands are required, use syntax that matches the active shell. Never assume bash on Windows.
- In PowerShell, avoid bash-specific patterns (`&&` chains, heredocs, bash-only quoting). Use PowerShell-native commands and quoting.
- For Windows paths or user-provided values, prefer PowerShell `-LiteralPath` and `Join-Path` patterns to avoid escaping bugs.
- If a shell-specific command fails due to quoting/parsing, retry immediately with shell-native syntax while keeping the same step coverage. Do not skip steps silently.

## Step -1 — Self-update check

Before doing anything else, fetch the latest version of this prompt from the up-skill repo:

```
https://raw.githubusercontent.com/slowpulsestudio/iris-proto-build-react/main/.github/prompts/skill-me-up.prompt.md
```

Compare the fetched `version:` frontmatter field to the `version:` field in the current `.github/prompts/skill-me-up.prompt.md` in this project. If the version field is missing from either file, fall back to comparing full file contents instead.

- **If the versions (or full contents, when falling back) are identical:** continue to Step 0.
- **If they differ:** tell the user: *"There are updates available for the skill-me-up prompt. Would you like me to update it now? You'll need to run `/skill-me-up` again after."*
  - If yes: overwrite `.github/prompts/skill-me-up.prompt.md` with the fetched version and stop. Do not continue setup.
  - If no: continue to Step 0 with the current version.

## Step -0 — Upfront prereq preflight

Before Step 0, run a read-only preflight check for local prerequisites. Do not install anything automatically in this step.

Check and report each item clearly as pass/fail:

1. Git is installed (`git --version`)
2. Node.js is installed (`node --version`)
3. pnpm is installed (`pnpm --version`)
4. The active shell is identified correctly (PowerShell on Windows, zsh/bash on macOS/Linux)

If any check fails, stop and give one exact next command for the user to run, then wait for confirmation before continuing.

If all checks pass, continue to Step 0.

## Step 0 — Skills setup

`platform/poc-iris-react` is now mandatory for all projects. Legacy `platform/iris-react-with-shell` and standalone `platform/iris-react` are retired.

Check whether a `.skills` file exists in the root of this project.

**If `.skills` exists:** read it to get the skill list, then normalize it before doing anything else:

- If `platform/iris-react` is present, replace it with `platform/poc-iris-react`.
- If `platform/iris-react-with-shell` is present, replace it with `platform/poc-iris-react`.
- If `platform/poc-iris-react` is missing, add it.
- If multiple platform entries are present, keep only `platform/poc-iris-react`.

Write the normalized `.skills` file back immediately, then proceed to Answer tracking below — new questions added to the prompt since the project was first set up will be asked now if their key is missing from `.skill-answers`. After resolving any missing answers, skip to Step 0b.

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

The platform is fixed and must always be `platform/poc-iris-react`. Do not ask a platform-selection question.

**`workflow-skills`** — *"`workflow/general` is always included. The skills below are pre-selected by default — deselect any that don't apply, and add any others you need:"*

- [on] `workflow/architecture`
- [on] `workflow/deep-linking`
- [on] `workflow/figma-read-from-mcp`
- [off] `workflow/figma-write-to-canvas`
- [off] `workflow/figma-update-existing-screen`
- [on] `workflow/git`
- [on] `workflow/motion`
- [on] `workflow/testing`
- [off] `workflow/windows`
- [on] `workflow/vercel-publish`
- [off] `workflow/migrate-non-iris-to-iris`
- [off] `workflow/vercel-password`

**`git-remote`** — only if `workflow/git` was selected: *"What is the GitHub repo URL for this project?"*

**`figma-url`** — only if `workflow/figma-read-from-mcp` or `workflow/figma-write-to-canvas` was selected: *"What is the Figma file URL for this project?"* Give the user two options:
- Paste the URL now — save it to `.figma-url` in the project root
- *"I'll paste it in this chat when I have it"* — reply: *"No problem — paste the Figma URL in this chat whenever you're ready and I'll save it to `.figma-url`."* then continue setup. When the user later pastes a URL starting with `https://www.figma.com/`, write it to `.figma-url`.

Once all questions are resolved, write the `.skills` file if it doesn't exist yet, using the standard comment header followed by the chosen skills, one per line. Always include `platform/poc-iris-react` as the platform entry and `workflow/general` as the first workflow entry:

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

## Step 0c — Connect Figma MCP (if applicable)

If `workflow/figma-read-from-mcp` or `workflow/figma-write-to-canvas` is in the skills list, the Figma MCP server must be connected before continuing. If both skills are selected, this only needs to happen once — do not repeat it.

Before any MCP connection check or walkthrough, ask exactly:

*"Is this the correct email address for your Figma account?"*

If needed, ask the user to provide the email first, then ask this confirmation question. Do not continue until they confirm.

First check whether it's already connected: call `get_metadata` on the file in `.figma-url` (or a lightweight `use_figma` read). If real data comes back, the connection already works — skip the walkthrough below.

If it does not work, walk the user through connecting via Figma's own UI. Never write or edit `mcp.json` by hand, never use VS Code's "Add MCP Server" command, and never consider a non-cloud/local server address:

1. Open the Figma desktop app (or figma.com), open the target file, and switch to **Dev Mode**.
2. Open the **MCP** panel and go to **Clients**.
3. Next to **Visual Studio Code**, click **+** / **Get Figma integration**.
4. Figma auto-installs the integration, opens VS Code, and completes the connection automatically — no config file, no copy-pasted URL, no command palette steps.

After the walkthrough, call `get_metadata` again to confirm the connection now works before continuing to Step 1.

## Step 1 — Rebuild master-skills.md and refresh example-prompts.md

For each skill name, fetch the corresponding skill file from GitHub using this URL pattern:

```
https://raw.githubusercontent.com/slowpulsestudio/iris-proto-build-react/main/skills/{skill-name}.md
```

In the exact same parallel fetch batch as the skill files above — not a separate step, not a later tool call — also fetch this URL, regardless of which skills are selected (it's general reference material for Designers, not skill-specific):

```
https://raw.githubusercontent.com/slowpulsestudio/iris-proto-build-react/main/example-prompts.md
```

This file is easy to silently drop because it isn't a "skill" — treat its fetch as mandatory on every single run, with no exceptions, and confirm in your own head that the fetch count is "number of skills + 1" before moving on.

Fetch everything in parallel every run, even when `.skills` has not changed, because upstream content may have changed. If any skill fails to fetch (404 or network error), stop before writing `master-skills.md` and report the failure clearly to the user, listing which skill(s) failed — do not silently omit a failed skill from the concatenated content. Then concatenate the skill files in the order they appear in `.skills`, with a blank line between each. Compare both the current `.skills` selection and the assembled skill content with the existing `master-skills.md` in the project root:

- If the `.skills` selection and assembled content are both unchanged, leave `master-skills.md` untouched and report that it is already up to date.
- If the `.skills` selection changed or any fetched skill content differs, write the assembled content to `master-skills.md`.
- If `master-skills.md` does not exist, create it.

Separately, compare the fetched example-prompts.md content to the existing `example-prompts.md` in the project root (if any):

- If it doesn't exist yet, or differs from the fetched content, write the fetched content to `example-prompts.md` in the project root.
- If it already matches, leave it untouched.
- This comparison and write must happen every run — do not skip it because `master-skills.md` was unchanged, and do not fold its result silently into the skills report without calling it out on its own line in Step 4.

## Step 2 — Copy skill-bundled files

After fetching each skill file, scan it for a `## Resources` section. If a skill has no `## Resources` section, skip this step for that skill.

The `## Resources` section contains directory copy mappings, one per line, in the format:

```
source-folder/ -> dest-folder/
```

- `source-folder/` is a path relative to `skill-resources/{skill-name}/` in the up-skill repo. `{skill-name}` is the full name including its category folder (e.g. `platform/poc-iris-react`, not just `poc-iris-react`) — use it as-is when building this base directory, never just its last path segment.
- `dest-folder/` is the destination path relative to this project's root

For each mapping, use the zip download approach:
1. Download the up-skill repo as a zip:
   `https://github.com/slowpulsestudio/iris-proto-build-react/archive/refs/heads/main.zip`
2. Extract only the files whose path within the zip starts with `iris-proto-build-react-main/skill-resources/{skill-name}/{source-folder}/` — for example, for the `platform/poc-iris-react` skill with a `poc-iris-react-main/` source folder, the full prefix is `iris-proto-build-react-main/skill-resources/platform/poc-iris-react/poc-iris-react-main/`.
3. Write each extracted file to `{project-root}/{dest-folder}/{relative-path}`, where `relative-path` is the portion after the prefix in step 2. Create any necessary directories.
4. If a file already exists at the destination and its content differs, warn the user and skip it — do not overwrite.
5. If a mapping matches zero files in the zip, this is an error, not an empty result — stop and report the exact prefix searched so the user can check the archive contents. Do not report it as "nothing to copy".

Download the zip once and reuse it for all resource mappings across all skills.

After all files are copied, if `project-name` is known from `.skill-answers`, find `index.html` in the project (check `src/iris-shell/index.html`, `src/iris-ui/index.html`, then the project root) and update the `<title>` tag to the project name. Skip silently if no `index.html` exists.

## Step 2b — Shell page selection (if applicable)

If `platform/poc-iris-react` is active, this must be resolved before continuing to Step 3, since it determines where the design gets built and what loads by default. This step happens after Step 2 so `src/lib/verticals.ts` actually exists in the project to read.

Check `.skill-answers` for `shell-page`.

- **If it exists:** skip silently.
- **If missing:**
  1. Read `src/lib/verticals.ts` to find the available products. Ask: *"What product is your prototype for?"* listing each vertical's `label` as an option. Save the choice as `shell-product` in `.skill-answers`.
  2. Read that vertical's `mainNav` entries. Ask: *"Where should we build your design? In an existing left-navigation page, or a new one?"* List every existing `mainNav` entry for that product (including disabled/placeholder pages) as options, plus an **"Add new page"** option.
  3. If an existing page is picked, use its `value` as `shell-page`.
  4. If "Add new page" is picked, ask for the new page's name and use it as `shell-page`. Add it as a new `mainNav` entry in that vertical in `verticals.ts` — no need to explain the mechanics of `verticals.ts`, product chooser, or routing to the Designer, just do it.
  5. Update that vertical's `defaultRoute` to the route for `shell-page`, so this screen is what loads by default when the product is opened.
- Save the answer as `shell-page = {value}` in `.skill-answers`.

## Step 3 — Create AI instruction files

Check for the following files and create them if they don't already exist:

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

**`README.md`** — using `project-name` and `project-description` from `.skill-answers`, the URL in `.figma-url` (if it exists), and the skill list from `.skills`:
```
# {project-name}

{project-description}

Generated by [Up-Skill](https://github.com/slowpulsestudio/iris-proto-build-react) — an AI prototyping skills library. This project's AI instructions are assembled from the skills below into `master-skills.md`. To pull in the latest skill updates, run `/skill-me-up` again.

**Figma file:** {figma-url}
```

Omit the `Figma file` line entirely if `.figma-url` doesn't exist. Follow it with a `## Skills used` heading and a bullet list of every skill name in `.skills`, one per line.

Check whether `README.md` already exists in the project root before generating it. This check happens on every run, not just the first — if a project was set up before this step existed, or the file was otherwise never created, generate it now on this rerun.

If any of these files already exist, leave them untouched — do not overwrite or append.

## Step 4 — Report

When done, report:
- Which skills were fetched successfully
- The total line count of `master-skills.md`, and whether it was created, updated, or already up to date
- Whether `example-prompts.md` was created, updated, or already up to date
- Any skills that failed to fetch (404 or network error)
- Which bundled files were copied (grouped by skill), and any that were skipped due to conflicts
- Whether `.github/copilot-instructions.md`, `CLAUDE.md`, `prototype-specific-agent-instructions.md`, and `README.md` were created or already existed

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
  - If yes: guide the user through connecting the repo to Vercel via the Vercel dashboard (Import Project → select repo). Once they confirm it's connected:
    1. Tell them to turn off **Vercel Authentication** (also called "Require Login") under Project Settings → Deployment Protection (`/~/settings/deployment-protection`) — otherwise preview/snapshot URLs will require a Vercel login to view, blocking Designers and stakeholders who don't have one.
    2. Point them to the project's **Deployments** tab in the Vercel dashboard — this is where they'll find build status, logs, and the URL for every push going forward.
    3. Save `vercel-setup = done` to `.skill-answers`.
  - If no: save `vercel-setup = no` to `.skill-answers` and skip.

**If `platform/poc-iris-react` is active AND (`workflow/figma-read-from-mcp` or `workflow/figma-write-to-canvas` is active) AND `.figma-url` exists** (ask after the Vercel question is resolved):
Check `.skill-answers` for `figma-build-prompted`.

Check `.skill-answers` for `figma-build-mode`.
- **If missing:** ask: *"When we build this screen, should we create a new screen from scratch, or update an existing screen from the `poc-iris-react` base?"*
- Save one of:
  - `figma-build-mode = create-new`
  - `figma-build-mode = update-existing`

- **If it exists:** skip silently.
- **If missing:** ask: *"You've got a Figma file connected — want me to start building out the design from it now, into the `{shell-page}` page?"*
- Save `figma-build-prompted = yes` or `figma-build-prompted = no` to `.skill-answers` regardless of the answer (so it's only asked once per project, not every rerun).
- If yes and `figma-build-mode = create-new`: proceed to implement using the `figma-read-from-mcp` skill rules, targeting `src/views/` and the page named in `shell-page`. After implementation, you must:
  1. Run a local build (`pnpm build`)
  2. Start or reuse the local dev server (`pnpm dev`)
  3. Open localhost to the new route and show the generated screen to the user before moving on
  4. Ask if they are happy with what was created
- If yes and `figma-build-mode = update-existing`: proceed using both `figma-read-from-mcp` and `figma-update-existing-screen` rules. Build-time flow must be:
  1. Produce the discrepancy audit table first (current code vs target design, plus check/cross columns for design-system availability and existing local implementation)
  2. Ask for approval of the audit
  3. Implement one discrepancy at a time
  4. Build locally and ask "are you happy with this change?" before moving to the next discrepancy
  5. Continue until all discrepancy rows are resolved or explicitly deferred
- If no: stop there — no further action.
