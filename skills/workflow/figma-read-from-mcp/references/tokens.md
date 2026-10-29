# Iris UI — Tokens

Semantic tokens standardise design decisions (colour, spacing, sizing, radius) in a reusable, theme-aware way. Prefer these over global primitives (see `foundations.md`).

## Naming convention

`--[namespace]-[context/category]-[role/object]-[modifier/attribute/state]` — namespace `--oi-`.

- `--oi-background-color-primary` — default background colour
- `--oi-content-color-primary` — primary content & icon colour
- `--oi-content-color-disabled` — disabled content
- `--oi-button-background-primary-hover` — component token, hover state

## Semantic colour tokens (Light → Dark source)

### Background

| Token | Light | Dark |
|---|---|---|
| `--oi-background-color-primary` | white | grey-950 |
| `--oi-background-color-secondary` | grey-100 | grey-900 |
| `--oi-background-color-tertiary` | grey-200 | grey-800 |
| `--oi-background-color-brand` | blue-50 | blue-950 |
| `--oi-background-color-info` | blue-50 | blue-950 |
| `--oi-background-color-success` | green-50 | green-950 |
| `--oi-background-color-warning` | yellow-50 | yellow-950 |
| `--oi-background-color-error` | red-50 | red-950 |

### Base (brand/status fills)

| Token | Light | Dark |
|---|---|---|
| `--oi-base-color-brand` | blue-500 | blue-500 |
| `--oi-base-color-info` | blue-500 | blue-500 |
| `--oi-base-color-success` | green-500 | green-500 |
| `--oi-base-color-warning` | yellow-500 | yellow-500 |
| `--oi-base-color-error` | red-500 | red-500 |

### Border

| Token | Light | Dark |
|---|---|---|
| `--oi-border-color-strong` | grey-400 | grey-600 |
| `--oi-border-color-default` | grey-300 | grey-700 |
| `--oi-border-color-muted` | grey-200 | grey-800 |

### Content (text & icons)

| Token | Light | Dark |
|---|---|---|
| `--oi-content-color-primary` | grey-900 | grey-100 |
| `--oi-content-color-secondary` | grey-700 | grey-300 |
| `--oi-content-color-tertiary` | grey-500 | grey-400 |
| `--oi-content-color-brand` | blue-600 | blue-500 |
| `--oi-content-color-constant` | white | white |
| `--oi-content-color-info` | blue-600 | blue-400 |
| `--oi-content-color-success` | green-600 | green-400 |
| `--oi-content-color-warning` | yellow-600 | yellow-400 |
| `--oi-content-color-error` | red-600 | red-400 |
| `--oi-content-color-link` | blue-600 | blue-400 |
| `--oi-content-color-link-hover` | blue-700 | blue-300 |
| `--oi-content-color-link-visited` | purple-600 | purple-400 |
| `--oi-content-color-inked` | black | white |
| `--oi-content-color-placeholder` | green-400 | green-600 |
| `--oi-content-color-disabled` | see Variables library | |

## Semantic spacing / sizing / radius

- **Spacing** (`--oi-spacing-*` → px): zero 0 · xs 4 · s 8 · m 12 · l 16 · xl 24 · xxl 32 · xxxl 48
- **Sizing** (`--oi-size-*`): xs → spacing-16 (1rem) · s → spacing-24 (1.5rem) · default → spacing-32 (2rem) · l → spacing-40 (2.5rem)
- **Border radius** (`--oi-border-radius-*`): s → spacing-2 (.125rem) · default → spacing-4 (.25rem) · l → spacing-8 (.5rem) · max → 50vh (pill)

## Component tokens (example: Button)

| Group | Tokens |
|---|---|
| Background | `--oi-button-background-{primary,secondary,danger}`, each with `-hover` / `-active`; `--oi-button-background-disabled` |
| Size (height) | `--oi-button-size-height-s` → size-s (1.5rem) · `-default` → size-default (2rem) · `-l` → size-l (2.5rem) |
| Gap | `--oi-button-gap-s` → spacing-6 · `-default` → spacing-s (8) · `-l` → spacing-m (12) |

Other components expose analogous component-level tokens — check the component's token file before styling it.

## Theming

Light, dark, and high-contrast (light & dark) are theme **modes** — the same semantic token resolves to a different primitive per theme. Reference the semantic token and the active theme does the rest.

Never build a separate dark version of a screen or swap values by hand — one screen, theme switched by the system. Default themes target WCAG 2.2 AA; high-contrast themes target all levels (see `accessibility.md`).
