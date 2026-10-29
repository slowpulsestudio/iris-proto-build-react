# Iris UI — Foundations

Reference values for the Iris UI primitives. Use the Iris UI tokens/styles rather than typing these numbers — they're listed so you can pick the right token and sanity-check that it resolved as expected. Namespace: `--oi-`.

## Colours (global primitives — Default theme)

Use sparingly — only when no semantic token maps to the use case (see `tokens.md`).

Hues: grey, blue, green, red, yellow, purple. Steps: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950. Token: `--oi-color-{hue}-{step}`. The Variables library holds the resolved hex/OKLCH per theme.

## Typography

- Sans (UI): `"Inter", system-ui, sans-serif` · Mono (code): `"IBM Plex Mono", monospace`
- Scale: Major second (1.125), base 1rem = 16px
- Weights: 400 body & code, 600 headings

### Type scale

The spec names (`--oi-font-size-5` etc.) differ from the names in the code (`src/iris-shell/src/tokens/tokens.primitives.css`). In code, use the code token.

| Spec token | Code token | px | Role |
|---|---|---|---|
| `--oi-font-size-5` | `--oi-font-size-xxxl` | 32 | Level 1 heading |
| `--oi-font-size-4` | `--oi-font-size-xxl` | 28 | Level 2 heading |
| `--oi-font-size-3` | `--oi-font-size-xl` | 24 | Level 3 heading |
| `--oi-font-size-2` | `--oi-font-size-l` | 20 | Level 4 heading |
| `--oi-font-size-1` | `--oi-font-size-m` | 16 | Level 5 heading |
| `--oi-font-size-base` | `--oi-font-size-m` | 16 | Body copy |
| `--oi-font-size-neg-1` | `--oi-font-size-s` | 14 | Body small, code |
| `--oi-font-size-neg-2` | `--oi-font-size-xs` | 12 | Helper & caption |

Line heights (`--oi-line-height-*`), weights (`--oi-font-weight-400` / `-600`), letter spacing (`--oi-letter-spacing-*`) and font families (`--oi-font-family-default` / `-code`) are tokens too.

### Text styles

| Style | font-size | line-height | weight | letter-spacing |
|---|---|---|---|---|
| `oi-heading-01` | size-5 | lh-5 | 600 | ls-3 |
| `oi-heading-02` | size-4 | lh-4 | 600 | ls-2 |
| `oi-heading-03` | size-3 | lh-3 | 600 | ls-1 |
| `oi-heading-04` | size-2 | lh-2 | 600 | — |
| `oi-heading-05` | size-1 | lh-1 | 600 | — |
| `oi-body` | base | lh-base | 400 | — |
| `oi-body-small` | neg-1 | lh-neg-1 | 400 | — |
| `oi-caption` | neg-2 | lh-neg-2 | 400 | — |
| `oi-code` | neg-1 | lh-neg-1 | 400 | — (IBM Plex Mono) |

## Spacing (`--oi-spacing-*`, 4-pt grid)

0 · 2 · 4 · 6 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96 · 112 · 128 (px). Semantic aliases (`--oi-spacing-xs`…`xxxl`) in `tokens.md`.

## Sizing (`--oi-sizing-*`)

2 · 4 · 8 · 12 · 16 · 20 · 24 · 28 · 32 · 48 · 64 (px). Semantic aliases (`--oi-size-xs`…`l`) in `tokens.md`.

## Elevations

Each token carries distinct light and dark shadows, resolved by theme — never hand-author shadows.

| Token | Role |
|---|---|
| `--oi-shadow-none` | Canvas / background / global areas |
| `--oi-shadow-low` | Main content area |
| `--oi-shadow-mid` | Dropdowns, menus, tooltips |
| `--oi-shadow-high` | Side sheet, modals, popover, toasts |

## Iconography

- Grids: 24×24 (base), 20×20, 16×16. viewBox stays 24×24; `size` sets width/height.
- Stroke: 1.5px default; 1px for 16px only. `strokeWidth` is a separate prop, not scaled from size.
- Rounded end caps; angles in 15° increments; corner radius 2.
- Default variant = stroke. Fill only for critical / warning / success.
- Props: `size: 16 | 20 | 24`, `strokeWidth: number` (passed directly, not derived from size).

## Layout breakpoints

| Name | Value | Range |
|---|---|---|
| xxlarge | 1920px | 1920+ |
| xlarge | 1440px | 1440–1919 |
| large | 1088px | 1088–1439 |
| medium | 768px | 768–1087 |
| small | 480px | 480–767 |
| xsmall | 320px | 320–479 |

Responsive padding: `--oi-spacing-16` for xsmall–large; `--oi-spacing-24` for xlarge/xxlarge. Layout guides are in the UI Kit library.
