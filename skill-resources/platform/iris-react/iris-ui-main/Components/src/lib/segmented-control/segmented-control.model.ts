// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
/** Content layout of the segmented control segments. */
export type SegmentedControlType = 'text-only' | 'icon-text' | 'icon-only';

/** A single segment in the segmented control. */
export interface SegmentedControlItem {
  /** Visible label text. Also used as the accessible name for icon-only segments. */
  label: string;
  /** The value emitted when this segment is selected. */
  value: string;
  /** Icon name shown inside the segment. Required for `'icon-text'` and `'icon-only'` layouts. */
  iconName?: string;
}
