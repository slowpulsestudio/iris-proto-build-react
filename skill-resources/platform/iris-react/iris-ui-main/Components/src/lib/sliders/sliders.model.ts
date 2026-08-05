// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
/** Internal visual state of the slider thumb. Not a component input. */
export type SliderState = 'default' | 'active' | 'disabled';
/** Where the current-value label is displayed. `'none'` hides it; `'tooltip'` shows it above the active thumb; `'bottom'` renders it below the track. */
export type SliderLabel = 'none' | 'tooltip' | 'bottom';
/** Numeric constraints for the slider range. */
export interface SliderConfig {
  /** Minimum selectable value. */
  min: number;
  /** Maximum selectable value. */
  max: number;
  /** Increment between discrete snap positions. */
  step: number;
}
