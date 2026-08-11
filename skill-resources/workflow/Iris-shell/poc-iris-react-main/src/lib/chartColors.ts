/**
 * Categorical chart series colors.
 *
 * Every theme defines an ordered, index-based palette via the CSS custom
 * properties `--oi-chart-color-1..N` (see src/tokens/charts/*). Charts assign
 * color N to series N — the same strategy IBM Carbon / D3 `scaleOrdinal` use.
 * Keeping the cycling logic here means it lives in exactly one place.
 */

/** Number of categorical series colors defined by every theme. */
export const CHART_SERIES_COUNT = 6;

/**
 * CSS color reference for a zero-based series index, cycling through the
 * theme's `--oi-chart-color-1..N` tokens. Returns a `var(...)` reference so it
 * stays reactive to theme switches with no re-render.
 */
export function chartSeriesColor(index: number): string {
  const slot = ((index % CHART_SERIES_COUNT) + CHART_SERIES_COUNT) % CHART_SERIES_COUNT;
  return `var(--oi-chart-color-${slot + 1})`;
}
