import type { Ref } from 'react';
import { cx } from '../../lib/cx.js';
import { Icon } from '../Icon/Icon.js';
import { Menu, type MenuEntry } from '../Menu/Menu.js';
import styles from './Pagination.module.css';

/** Marker for a truncated (collapsed) range of pages. */
export type PaginationEllipsis = 'ellipsis';

/** Default items-per-page choices offered by the per-page menu. */
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];

export interface PaginationProps {
  /** Current 1-based page. */
  page: number;
  /** Total number of pages. */
  pageCount: number;
  /** Called with the requested 1-based page when the user navigates. */
  onPageChange: (page: number) => void;
  /** `default` shows numbered pages; `simplified` shows Previous / Next only. */
  variant?: 'default' | 'simplified';
  /** Pages shown on each side of the current page (default variant). */
  siblingCount?: number;
  /** Pages always shown at the start and end (default variant). */
  boundaryCount?: number;
  /** Accessible label for the navigation landmark. */
  ariaLabel?: string;
  /** Label for the previous-page control. */
  previousLabel?: string;
  /** Label for the next-page control. */
  nextLabel?: string;
  /**
   * Current items-per-page value. Providing this together with
   * `onPageSizeChange` reveals the "N per page" menu on the right-hand side.
   */
  pageSize?: number;
  /** Choices shown in the per-page menu (default `[10, 20, 30, 40, 50]`). */
  pageSizeOptions?: number[];
  /** Called with the chosen size when the user picks a new per-page value. */
  onPageSizeChange?: (size: number) => void;
  /** Formats each per-page option label (default `` `${n} per page` ``). */
  pageSizeLabel?: (size: number) => string;
  /** Static caption shown to the right of the count menu (default `'per page'`). */
  pageSizeSuffix?: string;
  /** Accessible label for the per-page menu (default `'Items per page'`). */
  pageSizeMenuLabel?: string;
  className?: string;
}

function range(start: number, end: number): number[] {
  const out: number[] = [];
  for (let i = start; i <= end; i += 1) out.push(i);
  return out;
}

/**
 * Compute the sequence of page numbers and ellipsis markers to render.
 *
 * Always keeps `boundaryCount` pages at each end and `siblingCount` pages on
 * either side of `page`, collapsing the gaps with an `'ellipsis'` marker.
 */
export function getPaginationRange(
  page: number,
  pageCount: number,
  siblingCount = 1,
  boundaryCount = 1,
): (number | PaginationEllipsis)[] {
  if (pageCount <= 0) return [];

  const startPages = range(1, Math.min(boundaryCount, pageCount));
  const endPages = range(
    Math.max(pageCount - boundaryCount + 1, boundaryCount + 1),
    pageCount,
  );

  const siblingsStart = Math.max(
    Math.min(page - siblingCount, pageCount - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : pageCount - 1,
  );

  return [
    ...startPages,
    ...(siblingsStart > boundaryCount + 2
      ? (['ellipsis'] as const)
      : boundaryCount + 1 < pageCount - boundaryCount
        ? [boundaryCount + 1]
        : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < pageCount - boundaryCount - 1
      ? (['ellipsis'] as const)
      : pageCount - boundaryCount > boundaryCount
        ? [pageCount - boundaryCount]
        : []),
    ...endPages,
  ];
}

/**
 * Pagination — navigate between pages of a paged collection.
 *
 * `default` renders numbered page buttons with truncation; `simplified`
 * renders only Previous / Next controls spread to the container edges.
 */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  variant = 'default',
  siblingCount = 1,
  boundaryCount = 1,
  ariaLabel = 'Pagination',
  previousLabel = 'Previous',
  nextLabel = 'Next',
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageSizeChange,
  pageSizeLabel = (n) => `${n} per page`,
  pageSizeSuffix = 'per page',
  pageSizeMenuLabel = 'Items per page',
  className,
}: PaginationProps) {
  // Clamp to a valid page so out-of-range props can't produce invalid
  // navigation targets or mismatched highlighting.
  const safePage = Math.min(Math.max(page, 1), Math.max(pageCount, 1));
  const atStart = safePage <= 1;
  const atEnd = safePage >= pageCount;

  const goPrev = () => {
    if (!atStart) onPageChange(safePage - 1);
  };
  const goNext = () => {
    if (!atEnd) onPageChange(safePage + 1);
  };

  // The per-page control is opt-in: only render it when the caller supplies
  // both a current size and a change handler (and has options to offer).
  const showPageSize =
    pageSize != null && onPageSizeChange != null && pageSizeOptions.length > 0;

  const pageSizeControl = showPageSize ? (
    <div className={styles.perPage}>
      <Menu
        ariaLabel={pageSizeMenuLabel}
        align="end"
        items={pageSizeOptions.map<MenuEntry>((n) => ({
          kind: 'item',
          label: String(n),
          selected: n === pageSize,
          onSelect: () => onPageSizeChange(n),
        }))}
        trigger={({ ref, onClick, expanded }) => (
          <button
            ref={ref as Ref<HTMLButtonElement>}
            type="button"
            className={styles.perPageTrigger}
            aria-haspopup="menu"
            aria-expanded={expanded}
            aria-label={`${pageSizeMenuLabel}, ${pageSizeLabel(pageSize)}`}
            onClick={onClick}
          >
            {pageSize}
            <Icon name="CaretDown" size="16px" />
          </button>
        )}
      />
      <span className={styles.perPageHint}>{pageSizeSuffix}</span>
    </div>
  ) : null;

  if (variant === 'simplified') {
    const nav = (
      <nav
        className={cx(styles.root, styles.simplified, className)}
        aria-label={ariaLabel}
      >
        <button
          type="button"
          className={cx(styles.item, styles.textBtn)}
          onClick={goPrev}
          disabled={atStart}
        >
          <Icon name="CaretLeft" size="16px" />
          {previousLabel}
        </button>
        <button
          type="button"
          className={cx(styles.item, styles.textBtn)}
          onClick={goNext}
          disabled={atEnd}
        >
          {nextLabel}
          <Icon name="CaretRight" size="16px" />
        </button>
      </nav>
    );

    // Without the per-page control, keep the original edge-to-edge nav so
    // existing callers are untouched.
    if (!pageSizeControl) return nav;
    return (
      <div className={cx(styles.container, styles.containerSimplified)}>
        {nav}
        {pageSizeControl}
      </div>
    );
  }

  const items = getPaginationRange(safePage, pageCount, siblingCount, boundaryCount);

  const nav = (
    <nav className={cx(styles.root, className)} aria-label={ariaLabel}>
      <button
        type="button"
        className={styles.item}
        onClick={goPrev}
        disabled={atStart}
        aria-label={previousLabel}
      >
        <Icon name="CaretLeft" size="16px" />
      </button>

      {items.map((item, i) =>
        item === 'ellipsis' ? (
          // eslint-disable-next-line react/no-array-index-key
          <span key={`ellipsis-${i}`} className={styles.ellipsis} aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={cx(styles.item, item === safePage && styles.current)}
            aria-current={item === safePage ? 'page' : undefined}
            aria-label={`Page ${item}`}
            onClick={() => onPageChange(item)}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        className={styles.item}
        onClick={goNext}
        disabled={atEnd}
        aria-label={nextLabel}
      >
        <Icon name="CaretRight" size="16px" />
      </button>
    </nav>
  );

  // No per-page control → render the bare nav exactly as before (no DOM or CSS
  // change for existing consumers).
  if (!pageSizeControl) return nav;

  // Three-track grid keeps the numbered pages optically centered while the
  // per-page menu sits at the far right. The empty left track balances the nav.
  return (
    <div className={styles.container}>
      <span aria-hidden="true" />
      {nav}
      {pageSizeControl}
    </div>
  );
}
