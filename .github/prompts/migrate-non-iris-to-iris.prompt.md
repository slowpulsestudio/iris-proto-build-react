---
mode: agent
description: Migrate existing React components to the Iris-UI design system, one component at a time.
---

Read `master-skills.md` for your operating instructions before doing anything else.

## Step 1 — Audit

Before touching any code, audit the existing codebase:

- List every component in the project that is not already using Iris-UI
- For each component, identify its Iris-UI equivalent in `src/iris-shell/src/components/` (or note that none exists)
- List all hardcoded colour, spacing, and typography values that should be replaced with Iris tokens from `src/iris-shell/src/tokens/`

Present the full audit as a structured list and wait for the human to confirm before starting any migration.

## Step 2 — Migrate

Once the human confirms, migrate in this order:

1. **Tokens first** — replace hardcoded values with Iris tokens
2. **Base components** — swap leaf-level elements (buttons, inputs, icons)
3. **Composed components** — replace higher-level patterns (cards, modals, navigation)

Migrate **one component per response**. Do not proceed to the next until the human confirms the current one is working correctly.

For any component with no Iris-UI equivalent, stop and ask the human how to proceed — do not invent a substitute.
