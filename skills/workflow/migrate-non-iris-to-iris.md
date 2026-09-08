# Iris-React Migration Rules

These rules apply when migrating an existing React + Vite codebase to the Iris-UI design system. They apply in addition to the standard `project-type/iris-react` rules.

---

**Source of truth when onboarding an existing project**
When the project being migrated already has a live GitHub repo and/or Vercel deployment, those are the source of truth for current behaviour, content, and layout — not any Figma file. Only consult Figma (a Figma Make file or an original design file) to pull a specific component's exact spec (colours, spacing, typography, states) when the running code doesn't make that decision clear. Never treat a Figma file as more authoritative than the actual running code/deployment, and never let a stale original design file override what the live code/deployment already does. If `figma-stale = yes` is set in `.skill-answers` (the Designer flagged the Figma file as stale during setup), this rule always applies: base the migration audit on the codebase already present in this project, not on the Figma file.

**A failed response looks like:**
- Rebuilding a screen to match a Figma file instead of the existing running code/deployment
- Treating an out-of-date original design file as authoritative over the live GitHub/Vercel version
- Pulling whole-screen layout or content from Figma when the existing code already defines it

---

**Read before touching anything**
Before changing a single component, audit the existing codebase: catalogue every component, identify its Iris-UI equivalent (or note that none exists), and map out the token replacements for colours, spacing, and typography. Present this audit to the human for review before starting.

**A failed response looks like:**
- Starting to swap components before completing an audit
- Assuming a component has an Iris-UI equivalent without checking `src/iris-shell/src/components/` first
- Presenting the audit and starting migration in the same response without waiting for confirmation

---

**Migration order**
Always migrate in this sequence:
1. **Tokens first** — replace hardcoded colours, spacing, and typography values with Iris tokens
2. **Base components** — swap leaf-level elements (buttons, inputs, icons) to their Iris-UI equivalents
3. **Composed components** — replace higher-level patterns (cards, modals, navigation) last, once the base layer is stable

**A failed response looks like:**
- Replacing a composed component before its child base components have been migrated
- Mixing token replacement and component swaps in the same pass

---

**Bespoke components with no Iris-UI equivalent**
If a component has no direct Iris-UI equivalent, flag it explicitly and ask the human how to proceed — do not invent a substitute or silently skip it.

**A failed response looks like:**
- Replacing a bespoke component with the "closest" Iris component without flagging the mismatch
- Skipping a component and not mentioning it

---

**Style conflicts**
Iris tokens take precedence over existing CSS. When a conflict exists between an existing style and an Iris token value, remove the existing style — do not keep both. Flag any case where the existing style appears intentional or brand-specific before removing it.

**A failed response looks like:**
- Leaving both an old CSS value and an Iris token in place
- Silently removing a style that was clearly a deliberate design decision without flagging it

---

**One component at a time**
Migrate one component per response. Do not batch multiple component swaps into a single change unless the human explicitly asks for it.

**A failed response looks like:**
- Migrating several components in one go without being asked to
- Submitting a large diff that touches many files at once

---

**Verify before moving on**
After each component migration, confirm the result compiles and renders correctly before moving to the next component.

**A failed response looks like:**
- Moving to the next component without confirming the previous one builds
