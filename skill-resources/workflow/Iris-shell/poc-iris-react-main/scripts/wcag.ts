// Shared WCAG 2.2 contrast utilities for the theme a11y scripts.
//
// Thresholds below are WCAG 2.2 Level AA. (2.2 did not change the contrast
// minimums from 2.1; it only added focus-appearance criteria at AAA.)
//   - SC 1.4.3 Contrast (Minimum): normal text 4.5:1, large text 3:1
//     (large = >= 24px, or >= 18.66px/14pt bold).
//   - SC 1.4.11 Non-text Contrast: UI components & graphical objects 3:1.

export type Hex = `#${string}`;

export const AA_2_2 = {
  /** SC 1.4.3 — normal body text. */
  normalText: 4.5,
  /** SC 1.4.3 — large text (>= 24px, or >= 18.66px bold). */
  largeText: 3.0,
  /** SC 1.4.11 — UI components / graphical objects (borders, focus rings). */
  nonText: 3.0,
} as const;

export interface ContrastResult {
  ratio: number;
  min: number;
  passes: boolean;
}

/** sRGB channel -> linear-light value. */
function channel(int8: number): number {
  const c = int8 / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Relative luminance per WCAG 2.x definition. */
export function luminance(hex: Hex): number {
  const m = hex.replace('#', '');
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Contrast ratio (1..21) between two colors. */
export function contrast(a: Hex, b: Hex): number {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

/** Evaluate a pair against a WCAG 2.2 AA threshold. */
export function evaluate(fg: Hex, bg: Hex, min: number): ContrastResult {
  const ratio = contrast(fg, bg);
  return { ratio, min, passes: ratio >= min };
}

/** Format a ratio as e.g. "4.53:1". */
export function fmt(ratio: number): string {
  return `${ratio.toFixed(2)}:1`;
}
