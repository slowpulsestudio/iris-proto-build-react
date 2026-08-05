// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
/** Configuration for a single tab in the tab strip. */
export interface TabItem {
  /** Visible label text shown inside the tab button. */
  label: string;
  /** Value emitted when this tab is activated; used to identify the tab programmatically. */
  value: string;
  /** Optional icon name shown to the left of the label. */
  icon?: string;
  /** Optional numeric badge rendered beside the label. */
  counter?: number;
  /** Visual style of the counter badge. `'default'` is neutral; `'action'` uses the brand/action color. */
  counterType?: 'default' | 'action';
}
