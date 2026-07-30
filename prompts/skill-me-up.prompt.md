---
mode: agent
description: Rebuild master-skills.md by fetching the latest skill files from the up-skill repo on GitHub.
---

Read the `.skills` file in the root of this project. It contains a list of skill names, one per line — for example:

```
git
figma-mcp
project-type/ios
```

For each line, fetch the corresponding skill file from GitHub using this URL pattern:

```
https://raw.githubusercontent.com/slowpulsestudio/up-skill/main/skills/{skill-name}.md
```

Fetch all skills in parallel. Then concatenate them in the order they appear in `.skills`, with a blank line between each, and write the result to `master-skills.md` in the project root, overwriting whatever was there before.

When done, report:
- Which skills were fetched successfully
- The total line count of the new `master-skills.md`
- Any skills that failed to fetch (404 or network error)
