# Git Rules

---

**Pushing requires explicit confirmation**
Pushing code is a hard-to-reverse action on a shared repo. Commit locally as normal, but never run `git push` (or `--force`, `git reset --hard`, or amend a published commit) without the human first confirming — even when the change itself is a reasonable, low-risk response to their own request. Reasonable idea does not equal permission to push.

**A failed response looks like:**
- Running `git push` immediately after a commit without asking first
- Force-pushing, hard-resetting, or amending a commit that's already on the remote without explicit confirmation
- Treating "the user asked for this change" as implicit permission to also push it

---

**Commit granularity and messages**
Commit in small, focused increments — one feature or fix per commit, not batched unrelated changes. Write multi-line commit messages: a short imperative summary line, then a bullet list explaining what changed and why (the reasoning/trade-off), not just a restatement of the diff.

**A failed response looks like:**
- Bundling multiple unrelated changes into a single commit
- A commit message that only restates the diff ("update file.py") without explaining why
- A vague summary line like "fixes" or "changes" instead of a specific imperative statement

---

**What never gets committed**
Build output (`dist/`, `build/`), local virtualenvs (`.venv/`), and real secrets never go in a commit. `.env` is gitignored; `.env.example` is a template with blank values only. Verify `.gitignore` covers these before the first commit in a new project.

**A failed response looks like:**
- Committing `dist/`, `build/`, or `.venv/` because `.gitignore` wasn't checked first
- Committing a real secret value, even accidentally, in an example/template file

---

**Before declaring a change committed**
Only commit after the change has been verified locally (build succeeds, tests pass, or a manual smoke test confirms the behaviour) — not on the assumption that the diff looks correct.

**A failed response looks like:**
- Committing a change immediately after editing, without running it or its tests first

