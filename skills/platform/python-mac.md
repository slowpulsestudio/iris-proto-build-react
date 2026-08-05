# Python Mac App Rules

---

**Building**
After every code change, do a clean build before finishing. The `dist/` folder can have read-only files from a previous build — always `chmod` before deleting it.

```zsh
chmod -R u+w dist 2>/dev/null; rm -rf dist
source .venv/bin/activate
python -m PyInstaller -y "<AppName>.spec" 2>&1 | tail -10
```

**A failed response looks like:**
- Finishing a code change without rebuilding first
- Running `rm -rf dist` without the `chmod` step first — this fails silently when dist contains read-only files
- Running `pyinstaller` globally instead of from inside the activated venv

---

**Verifying the build**
After every successful build, launch the binary directly to catch import errors before the user tries it:

```zsh
"dist/<AppName>.app/Contents/MacOS/<AppName>" 2>&1 &
sleep 5 && kill %1 2>/dev/null
```

A `ModuleNotFoundError` means a dependency wasn't installed in the venv before building — install it and do a clean rebuild.

**A failed response looks like:**
- Declaring a build successful without launching the binary to check for import errors
- Telling the user to test the app before verifying it launches cleanly

---

**Venv and dependencies**
The venv lives at `.venv/` in the project root. `pyinstaller` must be installed inside the venv, not globally. After installing any new package, always do a clean rebuild (delete both `dist/` and `build/`) so PyInstaller re-analyses imports from scratch.

```zsh
source .venv/bin/activate
pip install -r requirements.txt
```

**A failed response looks like:**
- Installing `pyinstaller` globally instead of into the venv
- Skipping the clean rebuild after installing a new package — PyInstaller caches import analysis and will miss new dependencies

---

**Git**
Commit only changed source files — `dist/` and `build/` are gitignored and must never be committed. After a successful, verified build, commit and push the change.

Commit messages must be short and imperative, e.g. `Fix YouTube: use android client to avoid SABR streaming`.

**A failed response looks like:**
- Committing without a prior successful build and binary verification
- Including `dist/` or `build/` files in a commit
- Writing a vague or past-tense commit message
