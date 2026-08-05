// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
/** Visual variant of the pagination control. `'simplified'` hides individual page buttons and shows only prev/next. */
export type PaginationType = 'default' | 'simplified';

/** Event payload emitted by the pagination component on every page change. */
export interface PaginationChangeEvent {
  /** The newly selected page number (1-based). */
  page: number;
  /** The page number active before the change (1-based). */
  previousPage: number;
  /** Total number of pages, derived from `totalItems` and `pageSize`. */
  totalPages: number;
}
