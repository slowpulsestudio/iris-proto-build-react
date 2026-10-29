---
name: update-iris-packages
description: Updates the bundled Iris Shell / Iris UI files in src/iris-shell/ to the latest poc-iris-react version, without overwriting files this project has edited. Run only after the user says yes — when /skill-me-up asks "update the Iris packages?", or when the Designer asks to update or refresh the Iris packages, shell, or components.
---

# Update Iris Packages

Keeps `src/iris-shell/` in step with the latest `platform/poc-iris-react` baseline in the up-skill repo. Untouched files update silently; files this project has changed are never overwritten without asking. This skill only covers `platform/poc-iris-react` — other skills' bundled files follow `/skill-me-up` Step 2 as written.

---

**Source and destination**
- Upstream: the up-skill repo zip `https://github.com/slowpulsestudio/iris-proto-build-react/archive/refs/heads/main.zip`. During `/skill-me-up`, reuse the zip from Step 1a; otherwise download it now. If the download fails, stop and report the exact error.
- Files: every path starting with `iris-proto-build-react-main/skill-resources/platform/poc-iris-react/poc-iris-react-main/`. Zero matches is an error — stop and report the prefix searched.
- Destination: `src/iris-shell/{relative-path}`, where `relative-path` is the part after that prefix.

**A failed response looks like:**
- Updating from a cached or older copy instead of the freshly downloaded zip
- Reporting "nothing to update" when the prefix matched zero files

---

**Track every file in `.iris-packages-lock.json`**
The lock file in the project root (commit it, like `.skill-answers`) records, per file, the upstream version last offered and what was last written:

```json
{
  "version": 1,
  "files": {
    "src/iris-shell/src/App.tsx": { "upstream": "<sha256>", "written": "<sha256>" }
  }
}
```

Compute hashes with the shell's native tool (`shasum -a 256` on macOS/Linux, `Get-FileHash -Algorithm SHA256` in PowerShell). Write the lock file only if its content changed.

**A failed response looks like:**
- Overwriting files without recording them in the lock
- Comparing against the previous upstream from memory instead of the lock's hashes

---

**Decide per file**
For each upstream file, let `U` = upstream hash, `L` = local hash (if the file exists), `e` = its lock entry (if any). Apply the first matching rule:

| Situation | Action |
|---|---|
| File missing locally, no entry | Write it. Record `upstream = written = U`. |
| File missing locally, entry exists (deleted in this project) | If `U = e.upstream`, leave it deleted. Otherwise add to the **conflict list**. |
| `L = U` | Already current. Record `upstream = written = U`. |
| No entry (file existed before tracking began) | Add to the **conflict list** — we can't tell whether it was edited. |
| `L = e.written` (not edited locally) | Overwrite with upstream. Record `upstream = written = U`. |
| `L ≠ e.written` and `U = e.upstream` | Edited locally, upstream unchanged since last offered — leave it, say nothing. |
| `L ≠ e.written` and `U ≠ e.upstream` | Add to the **conflict list**. |

Then handle **files removed upstream** (lock entries no longer in the zip): local file missing → drop the entry; `L = e.written` → delete the file and drop the entry; otherwise add to the conflict list as a removal.

Never touch files in `src/iris-shell/` that have no lock entry and aren't in the zip — they belong to the project.

**A failed response looks like:**
- Overwriting a locally edited file because upstream changed
- Deleting a project-created file because it isn't upstream
- Re-asking about a file the Designer already chose to keep, when upstream hasn't changed since

---

**Resolve conflicts in one question**
If the conflict list is empty, skip this. Otherwise list the files (marking removals) and ask once, with clickable buttons: *"These Iris files have newer versions upstream, but they've been changed in this project. What would you like to do?"*
- **"Update them all to the latest version (my changes to these files are lost)"** — overwrite (or delete, for removals); record `upstream = written = U`.
- **"Keep my versions"** — leave them; record `upstream = U` and keep `written` (use the current `L` if there was no entry), so this version isn't offered again. For removals, drop the entry — the file now belongs to the project.
- **"Let me choose per file"** — clickable multi-select; update the ticked files, keep the rest.

If `workflow/git` is active and any listed file has uncommitted changes, say so in the question — updating would discard work that isn't in git history. Expect `src/iris-shell/src/lib/verticals.ts` to show up here: `/skill-me-up` edits it for the chosen product and default page.

**A failed response looks like:**
- Asking file by file in a long chain of separate questions
- Listing options as text to type back instead of clickable buttons
- Updating without mentioning that uncommitted changes will be lost

---

**Finish up**
1. If `project-name` is in `.skill-answers`, set the `<title>` in `src/iris-shell/index.html` to it, then set that file's `written` to the hash of the final file so the title doesn't count as a local edit next time.
2. If `src/iris-shell/package.json` or `src/iris-shell/pnpm-lock.yaml` changed, run `pnpm install` in `src/iris-shell/` and report the result.
3. Report: how many files were added, updated, removed, and already current; which conflicts were updated vs kept; which edited files were left alone because upstream hadn't changed; and whether `pnpm install` ran.

**A failed response looks like:**
- Leaving dependencies out of date after `package.json` changed
- A report that only says "updated" without counts or the kept/updated split
