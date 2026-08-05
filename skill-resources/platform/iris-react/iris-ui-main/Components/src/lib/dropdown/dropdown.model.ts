// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
/** Visual size of the dropdown trigger. */
export type DropdownSize = 'default' | 'lg';

/** A selectable option item in the dropdown list. */
export interface DropdownOptionItem {
  /** Discriminant field identifying this object as a selectable item. */
  type: 'item';
  /** Visible label text. */
  label: string;
  /** The value emitted when this option is selected. */
  value: string;
  /** Optional icon name shown to the left of the label. */
  icon?: string;
  /** When `true`, the option is visible but cannot be selected. */
  disabled?: boolean;
}

/** Union of all valid dropdown option shapes. Currently only `DropdownOptionItem`. */
export type DropdownOption = DropdownOptionItem;
