---
mode: agent
description: Rebuild master-skills.md by fetching the latest skill files from the up-skill repo on GitHub, and copy any skill-bundled files into this project.
---

Read the `.skills` file in the root of this project. It contains a list of skill names, one per line — for example:

```
workflow/git
workflow/figma-mcp
platform/ios
```

The file may also start with a `#`-prefixed comment header explaining what the file is. Skip blank lines and any line starting with `#` — they are comments, not skill names, and must not be fetched.

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

For each mapping:
1. Fetch the full file tree of the up-skill repo from the GitHub API:
   `https://api.github.com/repos/slowpulsestudio/up-skill/git/trees/main?recursive=1`
2. Filter the tree for all file entries whose path starts with `skill-resources/{skill-name}/{source-folder}/`
3. For each matching file, fetch it via raw GitHub:
   `https://raw.githubusercontent.com/slowpulsestudio/up-skill/main/{full-path}`
4. Write it to `{project-root}/{dest-folder}/{relative-path}`, where `relative-path` is the portion after `skill-resources/{skill-name}/{source-folder}/`. Create any necessary directories.
5. If a file already exists at the destination and its content differs, warn the user and skip it — do not overwrite.

Fetch the tree once and reuse it for all skills. Fetch and write all files in parallel.

## Step 3 — Report

When done, report:
- Which skills were fetched successfully
- The total line count of the new `master-skills.md`
- Any skills that failed to fetch (404 or network error)
- Which bundled files were copied (grouped by skill), and any that were skipped due to conflicts
