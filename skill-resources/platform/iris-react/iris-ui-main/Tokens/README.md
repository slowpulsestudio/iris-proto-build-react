# `@oneidentity/iris-ui-tokens`

Design tokens for Iris UI. Source of truth for all colours, spacing, radii, and other
design values, exported as SCSS custom property files.

---

## Contents

| Path | Description |
|---|---|
| `src/Global Primitives.tokens.json` | Raw colour palette — theme-independent primitive values |
| `src/Typography.tokens.json` | Theme-independent typography aliases shared by all themes |
| `src/Light.tokens.json` | Semantic tokens for the light theme |
| `src/Dark.tokens.json` | Semantic tokens for the dark theme |
| `src/High Contrast Light.tokens.json` | High-contrast light theme |
| `src/High Contrast Dark.tokens.json` | High-contrast dark theme |
| `src/Custom.tokens.json` | Manual per-theme shadows and focus ring tokens |

The theme and primitive JSON files are exported from Figma. `Typography.tokens.json` and
`Custom.tokens.json` are manual source files for shared typography aliases and per-theme
custom tokens.

---

## Generated output

Running the generate script compiles the JSON sources into SCSS custom property files in `dist/`:

| File | Selector |
|---|---|
| `dist/_tokens.primitives.scss` | `:root, :host` |
| `dist/_tokens.typography.scss` | `:root, :host` |
| `dist/_tokens.light.scss` | `body.theme-light, .theme-light, :host(.theme-light)` |
| `dist/_tokens.dark.scss` | `body.theme-dark, .theme-dark, :host(.theme-dark)` |
| `dist/_tokens.hc-light.scss` | `body.theme-hc-light, .theme-hc-light, :host(.theme-hc-light)` |
| `dist/_tokens.hc-dark.scss` | `body.theme-hc-dark, .theme-hc-dark, :host(.theme-hc-dark)` |
| `dist/_tokens.custom.scss` | per-theme custom selectors |
| `dist/_tokens.scss` | barrel — `@forward`s every layer in cascade order |
| `dist/tokens.css` | barrel — `@import`s every `.css` layer in cascade order |

Each file is also emitted as a plain `.css` twin (`dist/tokens.*.css`) for projects that
import CSS rather than SCSS.

`Typography.tokens.json` produces its **own** `:root` layer (`_tokens.typography.scss` /
`tokens.typography.css`) — it is **not** merged into the per-theme files, so theme-invariant
typography aliases are declared exactly once instead of being duplicated across every theme
output.

Every theme output is **self-sufficient**: it carries its full semantic token set (not just
overrides against light), so a component can activate any single theme in isolation —
including inside a shadow root — without needing another theme loaded as a base. No theme
is anchored to `:root`; theming is entirely opt-in via the `theme-*` class.

- **Typography** = semantic aliases that are the **same in every theme** (e.g.
  `--oi-text-heading-*`, `--oi-text-body-s-*`, `--oi-text-caption-*`, `--oi-text-code-*`).
  Emitted once at `:root`.
- **Custom** = hand-authored tokens that **differ per theme** (shadows, focus ring).
  Emitted per `body.theme-*` selector.

> **Font dependency:** the typography aliases only name the fonts
> (`--oi-text-code-font-family` → `var(--oi-font-family-code)`). The actual font files are
> **not** shipped by this package — the consuming app must load **Inter** and
> **IBM Plex Mono** (e.g. via `@fontsource/inter` + `@fontsource/ibm-plex-mono`, as the
> Components package does).

```bash
pnpm run tokens:generate
```

---

## Usage

### Recommended: single barrel

Both a CSS and an SCSS barrel are generated that pull every layer in the correct cascade
order (primitives → common → themes → custom), so you import **one** file:

```scss
// SCSS
@use '@oneidentity/iris-ui-tokens/dist/tokens';
```

```css
/* plain CSS */
@import '@oneidentity/iris-ui-tokens/dist/tokens.css';
```

### Manual: individual layers

If you need to control the order yourself or only pull specific layers, import them
individually (this is the cascade the barrel encodes):

```scss
@use '@oneidentity/iris-ui-tokens/dist/tokens.primitives';
@use '@oneidentity/iris-ui-tokens/dist/tokens.typography';
@use '@oneidentity/iris-ui-tokens/dist/tokens.light';
@use '@oneidentity/iris-ui-tokens/dist/tokens.dark';
@use '@oneidentity/iris-ui-tokens/dist/tokens.hc-light';
@use '@oneidentity/iris-ui-tokens/dist/tokens.hc-dark';
@use '@oneidentity/iris-ui-tokens/dist/tokens.custom';
```

## Applying a theme

Each theme is matchable three ways, so you can activate it wherever your app can set a
class:

```html
<!-- 1. document body (classic global theming) -->
<body class="theme-dark"> … </body>

<!-- 2. any light-DOM container -->
<div class="theme-dark"> … </div>
```

```css
/* 3. a web-component shadow host — set class="theme-dark" on the host element.
   Requires the tokens CSS to be loaded inside the shadow root so :host() matches. */
```

There is **no default theme**: nothing is emitted at `:root` for a theme. Every theme
output (`light`, `dark`, `hc-light`, `hc-dark`) is self-sufficient and opt-in — apply one
of the `theme-*` classes to activate it. This means a web component that only wants dark
mode can load just `tokens.dark` and set `theme-dark` on its host, without any other
theme acting as a fallback.

---

## Publishing

Publishing is manual. Bump the version in `package.json` before triggering the pipeline —
the pipeline will fail if the version already exists in the registry.

```bash
# From repo root
pnpm run tokens:publish
```
