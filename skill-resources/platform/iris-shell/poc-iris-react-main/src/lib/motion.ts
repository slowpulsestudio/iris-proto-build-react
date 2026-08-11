/**
 * Small motion helpers so chart animations stay driven by the design
 * system's motion tokens rather than hardcoded numbers.
 */

/** Whether the user has requested reduced motion. */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Numeric milliseconds from a CSS `--oi-motion-duration-*` token defined on
 * `:root` / the themed `<body>`. Handles both CSS `<time>` units: `ms`
 * (e.g. `200ms`) and `s` (e.g. `.2s`, which CSS minifiers emit as the
 * shorter equivalent of `200ms`). Returns 0 (no animation) if unreadable.
 */
export function motionDurationMs(token: string): number {
  const raw = getComputedStyle(document.body).getPropertyValue(token).trim();
  const value = parseFloat(raw);
  if (!Number.isFinite(value)) return 0;
  // CSS <time> is seconds unless explicitly suffixed with `ms`.
  return /ms$/.test(raw) ? value : value * 1000;
}
