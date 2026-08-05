// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
/** A single step in a breadcrumb trail. */
export interface BreadcrumbItem {
  /** Visible label text for this step. */
  label: string;
  /** URL for the breadcrumb link. Omit for the current (non-navigable) page. */
  href?: string;
}

/** Event payload emitted when a collapsed overflow item is selected from the dropdown. */
export interface BreadcrumbOverflowEvent {
  /** The breadcrumb item that was selected. */
  item: BreadcrumbItem;
  /** Zero-based index of the item within the original `items` array. */
  index: number;
}
