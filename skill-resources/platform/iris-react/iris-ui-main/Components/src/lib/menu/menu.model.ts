// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
/** Discriminant type for menu list items. */
export type MenuItemType = 'item' | 'separator';

/** Preferred opening position of the menu relative to its trigger element. */
export type MenuPosition = 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start';

/** A clickable menu item that may contain nested sub-items. */
export interface MenuActionItem {
  /** Unique identifier used to track which item was activated. */
  id: string;
  /** Discriminant field identifying this object as a clickable item. */
  type: 'item';
  /** Visible label text. If omitted the item renders icon-only. */
  label?: string;
  /** Icon name shown to the left of the label. */
  icon?: string;
  /** Nested items rendered as a submenu when this item is hovered or activated. */
  children?: MenuItem[];
  /** When `true`, the item is visible but cannot be activated. */
  disabled?: boolean;
  /** When `true`, the item is styled as a destructive (red/danger) action. */
  destructive?: boolean;
}

/** A non-interactive horizontal divider rendered between menu items. */
export interface MenuSeparatorItem {
  /** Discriminant field identifying this object as a separator. */
  type: 'separator';
}

/** Union of all valid menu list item shapes. */
export type MenuItem = MenuActionItem | MenuSeparatorItem;
