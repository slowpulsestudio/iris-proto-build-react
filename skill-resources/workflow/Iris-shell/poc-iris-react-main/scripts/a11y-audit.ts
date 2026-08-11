// A11y audit for the 7 "More themes" — checks WCAG 2.2 Level AA contrast for the
// current token values in src/tokens/more-themes/*.css.
//   run: node scripts/a11y-audit.ts
import { AA_2_2, evaluate, fmt, type Hex } from './wcag.ts';

interface Theme {
  bg: Hex;
  primary: Hex;
  secondary: Hex;
  tertiary: Hex;
  brand: Hex;
  info: Hex;
  success: Hex;
  warning: Hex;
  error: Hex;
  link: Hex;
  strong: Hex;
  focus: Hex;
  btnPrimary: Hex;
}

const white: Hex = '#FFFFFF';

const themes: Record<string, Theme> = {
  '__core-dark (baseline)': {
    bg: '#020618', primary: '#F1F5F9', secondary: '#CAD5E2', tertiary: '#90A1B9',
    brand: '#00A6F4', info: '#00BCFF', success: '#05DF72', warning: '#FDC700', error: '#FF6467',
    link: '#00BCFF', strong: '#45556C', focus: '#00A6F4', btnPrimary: '#00A6F4',
  },
  dracula: {
    bg: '#282A36', primary: '#F8F8F2', secondary: '#C7CAD9', tertiary: '#828FC0',
    brand: '#BD93F9', info: '#8BE9FD', success: '#50FA7B', warning: '#F1FA8C', error: '#FF6E6E',
    link: '#8BE9FD', strong: '#6272A4', focus: '#BD93F9', btnPrimary: '#6C4FBF',
  },
  'night-owl': {
    bg: '#011627', primary: '#D6DEEB', secondary: '#A7B6C9', tertiary: '#8A9E9E',
    brand: '#C792EA', info: '#82AAFF', success: '#22DA6E', warning: '#C5E478', error: '#EF5350',
    link: '#80CBC4', strong: '#5F7E97', focus: '#7E57C2', btnPrimary: '#7E57C2',
  },
  ayu: {
    bg: '#0D1017', primary: '#BFBDB6', secondary: '#8A9199', tertiary: '#828F9E',
    brand: '#E6B450', info: '#59C2FF', success: '#AAD94C', warning: '#FFB454', error: '#F26D78',
    link: '#E6B450', strong: '#5C6773', focus: '#E6B450', btnPrimary: '#8A6220',
  },
  'one-dark-pro': {
    bg: '#282C34', primary: '#ABB2BF', secondary: '#9199A5', tertiary: '#8D96A5',
    brand: '#61AFEF', info: '#56B6C2', success: '#98C379', warning: '#E5C07B', error: '#E98C93',
    link: '#61AFEF', strong: '#727B8F', focus: '#61AFEF', btnPrimary: '#2F79B8',
  },
  'tokyo-night': {
    bg: '#1A1B26', primary: '#A9B1D6', secondary: '#898EB0', tertiary: '#8188AE',
    brand: '#7AA2F7', info: '#7DCFFF', success: '#9ECE6A', warning: '#E0AF68', error: '#F7768E',
    link: '#7AA2F7', strong: '#656D92', focus: '#7AA2F7', btnPrimary: '#3D59A1',
  },
  catppuccin: {
    bg: '#1E1E2E', primary: '#CDD6F4', secondary: '#BAC2DE', tertiary: '#9399B0',
    brand: '#89B4FA', info: '#89DCEB', success: '#A6E3A1', warning: '#F9E2AF', error: '#F38BA8',
    link: '#89B4FA', strong: '#6C6F86', focus: '#89B4FA', btnPrimary: '#4372C4',
  },
  monokai: {
    bg: '#272822', primary: '#F8F8F2', secondary: '#C9C9C0', tertiary: '#9D9A83',
    brand: '#FF4B85', info: '#66D9EF', success: '#A6E22E', warning: '#FD971F', error: '#FA5E5E',
    link: '#66D9EF', strong: '#75715E', focus: '#F92672', btnPrimary: '#D81B5E',
  },
};

// Text tokens rendered as body text -> SC 1.4.3 normal-text 4.5:1.
const textKeys = ['primary', 'secondary', 'tertiary', 'brand', 'info', 'success', 'warning', 'error', 'link'] as const;

function tag(ratio: number, min: number): string {
  if (ratio < min) return `  <-- FAIL (AA needs ${min}:1)`;
  if (ratio < min + 0.5) return '  (marginal)';
  return '';
}

let failures = 0;

for (const [name, t] of Object.entries(themes)) {
  console.log(`\n=== ${name}  (bg ${t.bg}) ===`);

  for (const key of textKeys) {
    const { ratio, passes } = evaluate(t[key], t.bg, AA_2_2.normalText);
    if (!passes && !name.startsWith('__')) failures++;
    console.log(`  text ${key.padEnd(10)} ${t[key]}  ${fmt(ratio).padEnd(9)}${tag(ratio, AA_2_2.normalText)}`);
  }

  // Non-text UI: borders + focus ring -> SC 1.4.11 3:1.
  const strong = evaluate(t.strong, t.bg, AA_2_2.nonText);
  const focus = evaluate(t.focus, t.bg, AA_2_2.nonText);
  if (!strong.passes && !name.startsWith('__')) failures++;
  if (!focus.passes && !name.startsWith('__')) failures++;
  console.log(`  ui   border-str ${t.strong}  ${fmt(strong.ratio).padEnd(9)}${tag(strong.ratio, AA_2_2.nonText)}`);
  console.log(`  ui   focus-ring ${t.focus}  ${fmt(focus.ratio).padEnd(9)}${tag(focus.ratio, AA_2_2.nonText)}`);

  // Primary button label (white) on the button fill -> normal-text 4.5:1.
  const btn = evaluate(white, t.btnPrimary, AA_2_2.normalText);
  if (!btn.passes && !name.startsWith('__')) failures++;
  console.log(`  text btn-label  ${t.btnPrimary}  ${fmt(btn.ratio).padEnd(9)}${tag(btn.ratio, AA_2_2.normalText)}`);
}

console.log(
  failures === 0
    ? '\nAll new-theme checks meet WCAG 2.2 Level AA.'
    : `\n${failures} new-theme check(s) fail WCAG 2.2 Level AA.`,
);
