---
title: Token pipeline support for shared semantic alias source
status: accepted
severity: medium
domain: design-tokens
owners:
  - ui-platform
created: 2026-07-22
updated: 2026-07-22
definition_summary: The token pipeline hard-coded four theme JSON inputs plus primitives and custom tokens, with no home for theme-invariant semantic aliases such as the typography scale (font-size/line-height/font-weight/family per text role).
cause_summary: Theme generation is file-centric; generate-tokens.mjs reads each theme independently and had no composition step or output for a shared, theme-independent semantic token layer.
resolution_summary: Add a Common.tokens.json source for theme-invariant semantic aliases (typography roles) and emit it as its own :root layer (_tokens.common.scss / tokens.common.css) rather than merging it into every theme, so shared tokens are declared exactly once.
tool_usage:
  - list_dir
  - file_search
  - read_file
  - grep_search
  - run_in_terminal
references:
  - Tokens/scripts/generate-tokens.mjs
  - Tokens/src/Light.tokens.json
  - Tokens/src/Dark.tokens.json
  - Tokens/src/High Contrast Light.tokens.json
  - Tokens/src/High Contrast Dark.tokens.json
  - Tokens/src/Global Primitives.tokens.json
  - Tokens/src/Custom.tokens.json
  - Tokens/README.md
  - Components/src/styles/iris-ui.css
---

# Definition

The workspace token pipeline has six source inputs today:
- `Global Primitives.tokens.json`
- `Light.tokens.json`
- `Dark.tokens.json`
- `High Contrast Light.tokens.json`
- `High Contrast Dark.tokens.json`
- `Custom.tokens.json`

`Tokens/scripts/generate-tokens.mjs` flattens each source independently and emits theme-specific CSS/SCSS files into `Tokens/dist/`.

A new requirement is to introduce one common source file for **theme-invariant semantic
aliases** — specifically a typography scale (heading/body/caption/code roles, each bundling
font-size + line-height + font-weight, plus the code font-family) that is identical in every
theme.

# Context & Constraints

- No source-code consumer imported a `tokens.common` artifact before this change.
- `Components/src/styles/iris-ui.css` imports the token outputs directly.
- `@oneidentity/iris-ui-tokens` publishes the whole `dist/` folder, so any new output file becomes part of the package surface.
- The current dark output is intentionally override-only relative to light.
- Repo docs describe current public imports and will need to stay accurate.

Scope of the common layer is deliberately narrow: **typography semantic aliases only**
(`--oi-text-heading-03/04/05-*`, `--oi-text-body-s(-strong)-*`,
`--oi-text-caption(-strong)-*`, `--oi-text-code-*`). Colour, spacing, sizing and other
role tokens stay in the theme files — duplicating theme-invariant colours into a common
layer was explicitly rejected as noise.

# Cause / Root Cause Analysis

The generator has no abstraction for layered sources. It directly does:
1. read one file per theme
2. flatten tokens from that file only
3. emit one output per theme
4. compute dark overrides by comparing dark vs light

Because composition is absent, any semantic alias shared by all themes must be repeated in every theme JSON export.

# Options & Trade-offs

## Option A — Add common source and merge it into each theme output

Add `Tokens/src/Common Semantic Aliases.tokens.json` and have the generator merge it with each theme before writing existing outputs.

Pros:
- Smallest code change.
- No new public dist artifact.
- No consumer import changes.
- No package-consumer break risk.

Cons:
- Shared aliases still appear duplicated in generated light/hc outputs.
- Dist size does not improve much.

## Option B — Add common source and emit `tokens.common` output

Generate `tokens.common.css` and `_tokens.common.scss`, then remove shared aliases from theme outputs.

Pros:
- Clean runtime layering.
- Smaller themed outputs.
- Shared layer is explicit.

Cons:
- Public package surface changes.
- `Components/src/styles/iris-ui.css` must import the new file in the correct order.
- Direct token-package consumers must update imports.
- More documentation and release coordination.

# Planned Resolution (Decision & Rationale)

Choose **Option B**.

The common layer is a genuinely new, theme-independent runtime layer (the typography
scale), so giving it its own explicit `:root` output is the honest architecture: shared
tokens are declared exactly once, theme outputs stay lean, and the layering
(primitives → common → themes → custom) is visible to consumers. Option A was rejected
because merging the common tokens into every theme re-introduces the duplication this
change exists to remove — and, for the high-contrast outputs (which emit full blocks rather
than override-only), that duplication is real, not just cosmetic. The extra import and
release coordination are a one-time cost worth paying for a clean contract.

# Implementation Plan

1. **Add new source file**
   - Create `Tokens/src/Common.tokens.json` holding only theme-invariant typography aliases.
   - Structure is cosmetically nested (`text` → `heading-03` → leaf) for readability, but
     each leaf keeps its full `--oi-text-*` custom-property name so generated output is
     independent of the nesting.

2. **Refactor generator**
   - Read `Common.tokens.json` once and emit `_tokens.common.scss` + `tokens.common.css`
     at `:root`.
   - Do **not** merge common into the theme maps; light/dark/hc-light/hc-dark read their own
     files only, and dark stays override-only vs light.

3. **Wire the consumer import**
   - Import `tokens.common.css` in `Components/src/styles/iris-ui.css` immediately after
     primitives and before the theme files.

4. **Update source ownership docs**
   - `Tokens/README.md`, `Agent/INSTRUCTION.md`, and this ADR describe the separate common
     layer and the Common (theme-invariant) vs Custom (per-theme) distinction.

5. **Regenerate outputs**
   - Run the token build so `Tokens/dist/*` reflects the new common layer.
   - Expect mostly unchanged public filenames; content may shift only because source ownership moved.

# Risks, Assumptions, and Open Questions

- Assumption: shared aliases are truly theme-invariant; if a token later diverges for accessibility themes, it must move back to a theme file.
- Risk: if duplicate keys exist in both common and theme files, precedence must be explicit. Recommended rule: theme file overrides common.
- Risk: JSON exported from Figma may not naturally produce a separate common file; UX/export workflow must support this split.
- Open question: whether `--oi-base-color-*` should remain in theme files for conceptual clarity even if values match.

# Related Work Items / Links

- Token generator: `Tokens/scripts/generate-tokens.mjs`
- Primary consumer import surface: `Components/src/styles/iris-ui.css`
- Token package docs: `Tokens/README.md`

