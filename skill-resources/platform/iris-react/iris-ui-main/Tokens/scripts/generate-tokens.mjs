// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
// Token generator — reads JSON exports from Figma and outputs SCSS custom property files.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = join(__dirname, '..', 'src');
const OUT_DIR = join(__dirname, '..', 'dist');

rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

const HEADER = '// Auto-generated from Figma variable export. Do not edit manually. Run: pnpm run tokens:generate\n';
const TRAILING_NUM_RE = / \d+$/;

// Fallback stacks appended after the primary font name during generation.
// The JSON token contains only the font name; fallbacks live here.
const FONT_FAMILY_FALLBACKS = {
  '--oi-font-family-default': ['system-ui', 'sans-serif'],
  '--oi-font-family-code':    ['monospace'],
};

// ── Token value formatter ────────────────────────────────────────────────────

function resolveReference(refStr) {
  // e.g. "{colors.base.--oi-base-color-brand}" → "var(--oi-base-color-brand)"
  const inner = refStr.slice(1, -1);
  const parts = inner.split('.');
  for (let i = parts.length - 1; i >= 0; i--) {
    if (parts[i].startsWith('--')) {
      return `var(${parts[i]})`;
    }
  }
  return refStr;
}

function hexFromComponents(components) {
  return (
    '#' +
    components
      .slice(0, 3)
      .map((c) => Math.round(c * 255).toString(16).padStart(2, '0').toUpperCase())
      .join('')
  );
}

function formatColorValue(val) {
  if (typeof val === 'string') return resolveReference(val);
  const { alpha, hex, components } = val;
  if (alpha > 0.999) {
    return hex ? hex.toUpperCase() : hexFromComponents(components);
  }
  const [r, g, b] = components.map((c) => Math.round(c * 255));
  const a = Math.round(alpha * 100) / 100;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function formatNumberValue(key, val) {
  if (typeof val === 'string') return resolveReference(val);
  if (key === '--oi-border-radius-max') return '50vh';
  if (key.includes('opacity')) return String(Math.round(val * 100) / 100);
  if (key.includes('duration')) return `${Math.round(val)}ms`;
  if (key.includes('font-weight')) return String(val);
  return `${Math.round(val * 100) / 100}px`;
}

function formatToken(key, token) {
  const { $type, $value } = token;
  if ($type === 'string') {
    if (!key.startsWith('--')) return null; // Figma label alias, not a CSS property
    // Font-family: quote multi-word segments, leave single-word names unquoted.
    if (key.startsWith('--oi-font-family-')) {
      const primary = $value.includes(' ') ? `"${$value}"` : $value;
      const fallbacks = FONT_FAMILY_FALLBACKS[key] ?? [];
      return [primary, ...fallbacks].join(', ');
    }
    // All other -- string tokens (shadows, focus ring, etc.): emit raw CSS value.
    return $value;
  }
  if ($type === 'color') return formatColorValue($value);
  if ($type === 'number') return formatNumberValue(key, $value);
  return null;
}

// ── Walk nested token structure ──────────────────────────────────────────────

/**
 * Derive a CSS custom property name for tokens that weren't named with a '--'
 * prefix in Figma. Called only when the raw JSON key doesn't start with '--'.
 *
 * Rules:
 *  - font-family group  → --oi-font-family-{name}  (strips 'text-family-' prefix)
 *  - numeric-only keys  → --oi-{parent}-{key}       (e.g. '400' under font-weight)
 *  - everything else    → --oi-{key}
 */
function toCssVarName(key, path) {
  if (path.includes('font-family')) {
    return `--oi-font-family-${key.replace(/^text-family-/, '')}`;
  }
  if (/^\d+$/.test(key) || /^[A-Z]/.test(key)) {
    const parent = path[path.length - 1];
    if (!parent) return null;
    return `--oi-${parent}-${key.toLowerCase().replace(/\s+/g, '-')}`;
  }
  return `--oi-${key}`;
}

function walkTokens(obj, result = new Map(), path = []) {
  for (const [key, value] of Object.entries(obj)) {
    if (key === '$extensions') continue;
    const currentPath = [...path, key];
    if (value && typeof value === 'object' && '$type' in value) {
      let cssKey = key;
      if (!key.startsWith('--')) {
        if (value.$type === 'string' && !path.includes('font-family')) continue;
        cssKey = toCssVarName(key, path);
        if (!cssKey) continue;
      }
      if (result.has(cssKey)) continue;
      if (TRAILING_NUM_RE.test(cssKey)) continue;
      if (value.$type === 'string' && !cssKey.startsWith('--')) continue;
      const formatted = formatToken(cssKey, value);
      if (formatted !== null) result.set(cssKey, formatted);
    } else if (value && typeof value === 'object') {
      walkTokens(value, result, currentPath);
    }
  }
  return result;
}

// ── File helpers ─────────────────────────────────────────────────────────────

function readJson(filename) {
  return JSON.parse(readFileSync(join(SRC_DIR, filename), 'utf8'));
}

function renderBlock(selector, tokens) {
  const lines = [...tokens].map(([key, value]) => `  ${key}: ${value};`);
  return `${selector} {\n${lines.join('\n')}\n}\n`;
}

function writeScss(filename, content) {
  writeFileSync(join(OUT_DIR, filename), HEADER + '\n' + content, 'utf8');
  console.log(`Built ${filename}`);
}

function writeCss(filename, content) {
  writeFileSync(join(OUT_DIR, filename), content, 'utf8');
  console.log(`Built ${filename}`);
}

// ── Custom tokens (shadows, focus ring) — per-theme, not from Figma export ───

// ── Theme selectors ─────────────────────────────────────────────────────────
// Each theme is matchable three ways so a theme can be activated on the document
// body, on any light-DOM container, OR on a web-component shadow host (:host).
// The last is required by consumers that render inside shadow DOM and cannot set
// a class on the page <body> (e.g. embedded web components).
//
// No theme is anchored to :root: every theme selector is opt-in and every theme
// output carries its full token set, so a component can activate any single theme
// (light, dark, hc-light, hc-dark) in isolation without relying on another theme
// being loaded as a base layer.
function themeSelector(theme) {
  return [
    `body.theme-${theme}`,
    `.theme-${theme}`,
    `:host(.theme-${theme})`,
  ].join(', ');
}

const CUSTOM_THEME_SELECTORS = {
  light:      themeSelector('light'),
  dark:       themeSelector('dark'),
  'hc-light': themeSelector('hc-light'),
  'hc-dark':  themeSelector('hc-dark'),
};

function buildCustomScss(data) {
  return Object.entries(CUSTOM_THEME_SELECTORS)
    .filter(([theme]) => data[theme])
    .map(([theme, selector]) => renderBlock(selector, walkTokens(data[theme])))
    .join('\n');
}

// ── Main ──────────────────────────────────────────────────────────────────────

// Typography = theme-independent semantic aliases (typography scale). Emitted once at
// :root as its own layer — NOT merged into the per-theme files, to avoid duplicating
// theme-invariant tokens across the light/dark/hc outputs.
const typographyTokens = walkTokens(readJson('Typography.tokens.json'));
const lightTokens = walkTokens(readJson('Light.tokens.json'));
const darkTokens = walkTokens(readJson('Dark.tokens.json'));
const hcLightTokens = walkTokens(readJson('High Contrast Light.tokens.json'));
const hcDarkTokens = walkTokens(readJson('High Contrast Dark.tokens.json'));
const primitiveTokens = walkTokens(readJson('Global Primitives.tokens.json'));

// Every theme emits its FULL token set so that any single theme is self-sufficient —
// activating one theme (e.g. dark) inside a shadow root gives a component every semantic
// token it needs without also having to load the light theme as a base.
// Primitives and typography are theme-independent and belong to a "root" scope.
// We emit them under BOTH :root (matches the document root in light DOM) and :host
// (matches the shadow host when the stylesheet is loaded inside a shadow root),
// so a web component can load these files inside its shadow root and still get the
// tokens registered. In light DOM the :host rule is a harmless no-op.
const ROOT_SELECTOR = ':root, :host';

writeScss('_tokens.light.scss',      renderBlock(themeSelector('light'), lightTokens));
writeScss('_tokens.dark.scss',       renderBlock(themeSelector('dark'), darkTokens));
writeScss('_tokens.hc-light.scss',   renderBlock(themeSelector('hc-light'), hcLightTokens));
writeScss('_tokens.hc-dark.scss',    renderBlock(themeSelector('hc-dark'), hcDarkTokens));
writeScss('_tokens.primitives.scss', renderBlock(ROOT_SELECTOR, primitiveTokens));
writeScss('_tokens.typography.scss', renderBlock(ROOT_SELECTOR, typographyTokens));
writeScss('_tokens.custom.scss',     buildCustomScss(readJson('Custom.tokens.json')));

const customContent = buildCustomScss(readJson('Custom.tokens.json'));
writeCss('tokens.primitives.css', renderBlock(ROOT_SELECTOR, primitiveTokens));
writeCss('tokens.typography.css', renderBlock(ROOT_SELECTOR, typographyTokens));
writeCss('tokens.light.css',      renderBlock(themeSelector('light'), lightTokens));
writeCss('tokens.dark.css',       renderBlock(themeSelector('dark'), darkTokens));
writeCss('tokens.hc-light.css',   renderBlock(themeSelector('hc-light'), hcLightTokens));
writeCss('tokens.hc-dark.css',    renderBlock(themeSelector('hc-dark'), hcDarkTokens));
writeCss('tokens.custom.css',     customContent);

// ── Barrels ─────────────────────────────────────────────────────────────────
// Single entry points that pull every layer in the correct cascade order:
// primitives → common → themes → custom. Consumers import one file instead of
// wiring up all seven by hand.
const LAYER_ORDER = [
  'tokens.primitives',
  'tokens.typography',
  'tokens.light',
  'tokens.dark',
  'tokens.hc-light',
  'tokens.hc-dark',
  'tokens.custom',
];

// CSS barrel: plain @import of each generated .css twin.
writeCss(
  'tokens.css',
  LAYER_ORDER.map((name) => `@import './${name}.css';`).join('\n') + '\n',
);

// SCSS barrel: @forward each partial so `@use '.../tokens'` emits every layer.
writeScss(
  '_tokens.scss',
  LAYER_ORDER.map((name) => `@forward '${name}';`).join('\n') + '\n',
);
