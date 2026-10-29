// Verifies PROPOSED contrast fixes for the 9 "More themes" against WCAG 2.2
// Level AA before they are written into src/tokens/more-themes/*.css.
//   run: node scripts/a11y-verify.ts
import { AA_2_2, evaluate, fmt, type Hex } from './wcag.ts';

interface Proposal {
  bg: Hex;
  tertiary: Hex;
  secondary: Hex;
  btn: Hex;
  label?: Hex;
  strong: Hex;
  error: Hex;
  brand: Hex;
}

const white: Hex = '#FFFFFF';

const proposals: Record<string, Proposal> = {
  dracula: { bg: '#282A36', tertiary: '#828FC0', secondary: '#C7CAD9', btn: '#6C4FBF', strong: '#6272A4', error: '#FF6E6E', brand: '#BD93F9' },
  'night-owl': { bg: '#011627', tertiary: '#8A9E9E', secondary: '#A7B6C9', btn: '#7E57C2', strong: '#5F7E97', error: '#EF5350', brand: '#C792EA' },
  ayu: { bg: '#0D1017', tertiary: '#828F9E', secondary: '#8A9199', btn: '#8A6220', strong: '#5C6773', error: '#F26D78', brand: '#E6B450' },
  'tokyo-night': { bg: '#1A1B26', tertiary: '#8188AE', secondary: '#898EB0', btn: '#3D59A1', strong: '#656D92', error: '#F7768E', brand: '#7AA2F7' },
  catppuccin: { bg: '#1E1E2E', tertiary: '#9399B2', secondary: '#BAC2DE', btn: '#4372C4', strong: '#6C7086', error: '#F38BA8', brand: '#89B4FA' },
  monokai: { bg: '#272822', tertiary: '#9D9A83', secondary: '#C9C9C0', btn: '#D81B5E', strong: '#75715E', error: '#FA5E5E', brand: '#FF4B85' },
  synthwave: { bg: '#262335', tertiary: '#848BBD', secondary: '#D3CCE3', btn: '#614D85', strong: '#6470B5', error: '#FF5A63', brand: '#FF7EDB' },
  aura: { bg: '#15141B', tertiary: '#ADACAE', secondary: '#CDCCCE', btn: '#61FFCA', label: '#15141B', strong: '#6D6D6D', error: '#FF6767', brand: '#A277FF' },
  flexoki: { bg: '#100F0F', tertiary: '#878580', secondary: '#B7B5AC', btn: '#3AA99F', label: '#100F0F', strong: '#6F6E69', error: '#E8705F', brand: '#4385BE' },
};

let allPass = true;

for (const [name, p] of Object.entries(proposals)) {
  const checks: Array<[string, ReturnType<typeof evaluate>]> = [
    ['tertiary vs bg', evaluate(p.tertiary, p.bg, AA_2_2.normalText)],
    ['secondary vs bg', evaluate(p.secondary, p.bg, AA_2_2.normalText)],
    ['error vs bg', evaluate(p.error, p.bg, AA_2_2.normalText)],
    ['brand vs bg', evaluate(p.brand, p.bg, AA_2_2.normalText)],
    ['btn white label', evaluate(p.label ?? white, p.btn, AA_2_2.normalText)],
    ['border-strong', evaluate(p.strong, p.bg, AA_2_2.nonText)],
  ];

  console.log(`\n=== ${name} ===`);
  for (const [label, r] of checks) {
    if (!r.passes) allPass = false;
    console.log(`  ${label.padEnd(18)} ${fmt(r.ratio).padEnd(9)} ${r.passes ? 'ok' : `FAIL (AA ${r.min}:1)`}`);
  }
}

console.log(
  allPass
    ? '\nAll proposed values meet WCAG 2.2 Level AA.'
    : '\nSome proposed values fail WCAG 2.2 Level AA — adjust.',
);
