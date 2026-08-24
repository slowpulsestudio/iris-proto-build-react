# Windows Workflow Rules

Use this skill when at least one downstream user is working on Windows.

---

## Goal

Keep setup and automation steps reliable in PowerShell and avoid shell-specific quoting or path bugs.

---

## 1. Match commands to the active shell

Always assume Windows users are likely running PowerShell (`pwsh` or Windows PowerShell), not bash.

- Detect the shell before writing command examples.
- Provide PowerShell-native command forms first for Windows users.
- Avoid bash-only syntax on Windows, including `&&` command chains, heredocs, and bash variable expansion patterns.

**A failed response looks like:**
- Giving Linux/macOS shell commands to a Windows user without a PowerShell equivalent
- Assuming Git Bash is available when the user did not say so

---

## 2. Use PowerShell-safe quoting and paths

Prefer patterns that are stable with spaces and special characters.

- Use single quotes for literal strings in PowerShell whenever possible.
- Use `Join-Path` and `-LiteralPath` for file system operations.
- Quote full paths that contain spaces.
- Avoid mixed quoting styles copied from bash examples.

**A failed response looks like:**
- Commands that break in paths like `C:\Users\A Name\...`
- Interpolating user input directly into unquoted path arguments

---

## 3. Prefer editor tools over fragile shell one-liners

For fetch/read/write/copy operations, prefer VS Code tools instead of long terminal one-liners.

- Use terminal commands only when they add clear value.
- Keep terminal commands short and shell-native.
- If a command must be cross-platform, provide separate snippets by shell.

**A failed response looks like:**
- A long multi-step bash one-liner copied into a Windows flow
- Complex quoting-heavy scripts when the same work can be done with editor tools

---

## 4. Retry policy for quoting failures

If an automation attempt fails due to PowerShell quoting/parsing, rerun with corrected PowerShell-native quoting and keep full step coverage.

Required coverage to preserve:
- Parallel fetch
- Rebuild
- Resource copy
- File creation

Use this user-facing status line when that happens:

"The first automation attempt hit a PowerShell quoting issue, so I am rerunning it with corrected quoting and the same step coverage (parallel fetch, rebuild, resource copy, and file creation)."

**A failed response looks like:**
- Skipping one of the required steps on rerun
- Silently changing workflow scope to avoid fixing quoting

---

## 5. Cross-platform communication rules

When giving instructions to mixed-platform teams:

- Label command blocks clearly as `PowerShell`, `zsh`, or `bash`.
- Do not present one shell's syntax as universal.
- Call out platform assumptions explicitly before execution.

**A failed response looks like:**
- Unlabeled command snippets in a Windows ticket
- Saying "run this" when the command is only valid in another shell
