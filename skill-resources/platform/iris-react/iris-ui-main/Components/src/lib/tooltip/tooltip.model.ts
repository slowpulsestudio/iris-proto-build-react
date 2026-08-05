// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
/** Preferred opening position of the tooltip relative to its trigger element. Falls back automatically when viewport space is limited. */
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
/** Configuration passed to `[irisTooltip]` as a single object binding. */
export interface TooltipConfig {
  /** Tooltip body text. */
  text: string;
  /** Optional keyboard shortcut displayed below the text, e.g. `['Ctrl', 'S']`. Each string is rendered as a key badge. */
  shortcut?: string[];
}
