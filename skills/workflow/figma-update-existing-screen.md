# Figma Update Existing Screen Rules

Use this workflow when the target already exists in the `poc-iris-react` base and the goal is to update it to a new design state, not build from scratch.

---

## 1. Audit first, no code changes yet

Before editing code, compare:
- current implemented screen in local code
- target design in Figma
- component/token availability in design system libraries and local resources

Produce a discrepancy table with these columns:
- Area or Component
- Current State (code)
- Target State (design)
- In Figma design system library (`check`/`cross`)
- Already built in local resources (`check`/`cross`)
- Planned action

Do not start implementation until the user confirms the audit.

**A failed response looks like:**
- Starting code changes before producing the discrepancy table
- Skipping either design-system availability or local-code availability checks
- Merging multiple discrepancies into one vague row

---

## 2. Implement one discrepancy at a time

After audit approval, process rows sequentially:
1. Implement only one discrepancy
2. Build locally (`pnpm build` at minimum)
3. Show what changed in plain language
4. Ask if the user is happy before moving to the next row

Never batch multiple discrepancy rows into a single implementation step unless explicitly asked.

**A failed response looks like:**
- Fixing multiple rows in one pass without user approval
- Moving to the next row without asking for confirmation
- Declaring completion without local build verification

---

## 3. Availability check rules

For each discrepancy row:
- If design-system library has the required pattern: prefer it
- If local resources already implement it: adapt/reuse before creating new code
- If neither exists: flag clearly and ask before introducing a new pattern

**A failed response looks like:**
- Rebuilding an existing local component from scratch
- Inventing a new UI pattern without explicit confirmation
- Treating "looks close enough" as a valid replacement without disclosure

---

## 4. Completion criteria

The update is complete only when:
- all discrepancy rows are resolved or explicitly deferred
- each implemented row was validated with a local build
- the user confirmed satisfaction row-by-row

End with a compact final table showing each row status (`done`, `deferred`, `blocked`).
