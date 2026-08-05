// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
/** Semantic type of the banner, which determines its icon and color. */
export type BannerType = 'info' | 'warning' | 'error' | 'success';
/** An action button rendered inside the banner body. */
export interface BannerAction {
  /** Button label text. */
  label: string;
  /** Called when the action button is clicked. Optional; no click handler if omitted. */
  callback?: () => void;
}
