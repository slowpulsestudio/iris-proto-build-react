import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { cx } from '../../lib/cx.js';
import { Checkbox } from '../Checkbox/Checkbox.js';
import { IconButton } from '../IconButton/IconButton.js';
import { Icon } from '../Icon/Icon.js';
import styles from './DataTable.module.css';

export type RowKey = string | number;

/** Default contract for rows: each must carry a stable `id`. Override by
 *  passing an explicit `rowKey` function when rows lack `id`. */
export interface DataTableRow {
  id: RowKey;
}

export interface DataTableColumn<TRow> {
  /** Unique key for the column. */
  key: string;
  /** Column title. */
  header: string;
  /** Icon to render before header. */
  icon?: string;
  /** Fixed CSS length (e.g. "180px" or 180). */
  width?: string | number;
  /** Floor when grow is used. */
  minWidth?: string | number;
  /** Ceiling for a flexible column so it stops growing on wide screens. */
  maxWidth?: string | number;
  /** Flex-grow weight; columns with `grow` share leftover horizontal space. */
  grow?: number;
  cell: (row: TRow, i: number) => ReactNode;
}

export interface DataTableEmptyState {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface DataTableProps<TRow extends DataTableRow> {
  rows: TRow[];
  columns: DataTableColumn<TRow>[];
  rowKey?: (row: TRow) => RowKey;
  /** Human-readable label for a row, used in screen-reader labels (checkbox,
   *  action button). Falls back to the row index when omitted. */
  rowLabel?: (row: TRow, i: number) => string;
  /** Accessible name for the scrollable table region. Also makes the region
   *  keyboard-focusable so it can be scrolled without a pointer. */
  ariaLabel?: string;
  selected?: Set<RowKey>;
  onSelectionChange?: (next: Set<RowKey>) => void;
  onRowAction?: (row: TRow) => void;
  /** Render a custom control (e.g. a menu trigger) in each row's trailing
   *  action cell. Takes precedence over the default `onRowAction` button. */
  rowActions?: (row: TRow, i: number) => ReactNode;
  /** Rendered inside the table body when `rows` is empty. */
  emptyState?: DataTableEmptyState;
  className?: string;
}

/**
 * DataTable — selectable data grid that flexes to fill its container.
 *
 * Columns without `grow` use their fixed `width`. Columns with `grow > 0`
 * never shrink below `minWidth` (or `width` if minWidth is omitted).
 *
 * Responsive: when the total minimum width exceeds the container the region
 * scrolls horizontally with the selection, first data, and action columns
 * pinned in place (with scroll-edge shadows). This holds at every breakpoint.
 */
export function DataTable<TRow extends DataTableRow>({
  rows,
  columns,
  rowKey = (r) => r.id,
  rowLabel,
  ariaLabel,
  selected,
  onSelectionChange,
  onRowAction,
  rowActions,
  emptyState,
  className,
}: DataTableProps<TRow>) {
  const selectable = !!selected && !!onSelectionChange;
  const allChecked =
    selectable && rows.length > 0 && rows.every((r) => selected!.has(rowKey(r)));
  const someChecked =
    selectable && !allChecked && rows.some((r) => selected!.has(rowKey(r)));

  /** Left inset for the pinned first data column: clears the checkbox column
   *  (which is --oi-size-l wide). */
  const firstColOffset = selectable ? 'var(--oi-size-l)' : '0';

  /* Track horizontal scroll position so pinned columns render an edge shadow
     only while there is content scrolled underneath them. */
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState({ start: false, end: false });
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      // Math.abs keeps this correct under RTL, where scrollLeft is negative.
      const pos = Math.abs(el.scrollLeft);
      const start = pos > 1;
      const end = pos < max - 1;
      setOverflow((prev) =>
        prev.start === start && prev.end === end ? prev : { start, end },
      );
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [columns, rows.length]);

  const toggleAll = (checked: boolean) => {
    if (!selectable) return;
    const next = new Set(selected);
    if (checked) rows.forEach((r) => next.add(rowKey(r)));
    else rows.forEach((r) => next.delete(rowKey(r)));
    onSelectionChange!(next);
  };

  const toggleRow = (key: RowKey, checked: boolean) => {
    if (!selectable) return;
    const next = new Set(selected);
    if (checked) next.add(key);
    else next.delete(key);
    onSelectionChange!(next);
  };

  return (
    <div
      ref={scrollerRef}
      className={styles.scroller}
      data-ovf-start={overflow.start ? '' : undefined}
      data-ovf-end={overflow.end ? '' : undefined}
      {...(ariaLabel ? { role: 'region', 'aria-label': ariaLabel, tabIndex: 0 } : {})}
    >
      <div className={cx(styles.table, className)} role="table">
      <div className={styles.head} role="row">
        {selectable && (
          <HeadCell width="40px" className={styles.checkboxCell} pin="startInner">
            <Checkbox
              ariaLabel="Select all rows"
              checked={allChecked}
              indeterminate={someChecked}
              onChange={toggleAll}
            />
          </HeadCell>
        )}
        {columns.map((col, ci) => (
          <HeadCell
            key={col.key}
            {...sizing(col)}
            pin={ci === 0 ? 'start' : undefined}
            pinOffset={ci === 0 ? firstColOffset : undefined}
          >
            {col.icon && (
              <span className={styles.headIcon}>
                <Icon name={col.icon} size="20px" />
              </span>
            )}
            <span className={styles.headLabel}>{col.header}</span>
          </HeadCell>
        ))}
        <HeadCell width="44px" className={styles.actionCell} pin="end" aria-label="Row actions" />
      </div>

      <div className={styles.body} role="rowgroup">
        {rows.length === 0 && emptyState && (
          <div role="row" className={styles.emptyRow}>
            <div role="cell" className={styles.emptyCell}>
              <p className={styles.emptyTitle}>{emptyState.title}</p>
              {emptyState.description && (
                <p className={styles.emptyDescription}>{emptyState.description}</p>
              )}
              {emptyState.actionLabel && emptyState.onAction && (
                <button
                  type="button"
                  className={styles.emptyAction}
                  onClick={emptyState.onAction}
                >
                  {emptyState.actionLabel}
                </button>
              )}
            </div>
          </div>
        )}
        {rows.map((row, i) => {
          const key = rowKey(row);
          const isSelected = selectable && selected!.has(key);
          const label = rowLabel ? rowLabel(row, i) : `row ${i + 1}`;
          return (
            <div
              key={key}
              role="row"
              aria-selected={isSelected || undefined}
              className={cx(styles.row, isSelected && styles.rowSelected)}
            >
              {selectable && (
                <BodyCell width="40px" className={styles.checkboxCell} pin="startInner">
                  <Checkbox
                    ariaLabel={`Select ${label}`}
                    checked={isSelected}
                    onChange={(c) => toggleRow(key, c)}
                  />
                </BodyCell>
              )}
              {columns.map((col, ci) => (
                <BodyCell
                  key={col.key}
                  {...sizing(col)}
                  pin={ci === 0 ? 'start' : undefined}
                  pinOffset={ci === 0 ? firstColOffset : undefined}
                >
                  {col.cell(row, i)}
                </BodyCell>
              ))}
              <BodyCell width="44px" className={styles.actionCell} pin="end">
                {rowActions ? (
                  rowActions(row, i)
                ) : (
                  <IconButton
                    icon="DotsThree"
                    ariaLabel={`Actions for ${label}`}
                    size="s"
                    onClick={() => onRowAction?.(row)}
                  />
                )}
              </BodyCell>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}

type Pin = 'start' | 'startInner' | 'end';

interface CellSizing {
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  grow?: number;
}

/** Convert a column config to {width, minWidth, grow} props for cells. */
function sizing<TRow>(col: DataTableColumn<TRow>): CellSizing {
  return { width: col.width, minWidth: col.minWidth, maxWidth: col.maxWidth, grow: col.grow };
}

/** Class list for a pinned (sticky) cell, or undefined when not pinned. */
function pinClassName(pin?: Pin): string | undefined {
  switch (pin) {
    case 'start':
      return cx(styles.pin, styles.pinStart);
    case 'startInner':
      return cx(styles.pin, styles.pinStartInner);
    case 'end':
      return cx(styles.pin, styles.pinEnd);
    default:
      return undefined;
  }
}

interface HeadCellProps extends CellSizing {
  className?: string;
  children?: ReactNode;
  pin?: Pin;
  pinOffset?: string;
  'aria-label'?: string;
}

function HeadCell(props: HeadCellProps) {
  const { className, children, pin, pinOffset, ...rest } = props;
  return (
    <div
      role="columnheader"
      className={cx(styles.headCell, pinClassName(pin), className)}
      style={cellStyle(props, pinOffset)}
      {...stripStyleProps(rest)}
    >
      {children}
    </div>
  );
}

interface BodyCellProps extends CellSizing {
  className?: string;
  children?: ReactNode;
  pin?: Pin;
  pinOffset?: string;
}

function BodyCell(props: BodyCellProps) {
  const { className, children, pin, pinOffset } = props;
  return (
    <div
      role="cell"
      className={cx(styles.cell, pinClassName(pin), className)}
      style={cellStyle(props, pinOffset)}
    >
      {children}
    </div>
  );
}

/** Build the inline style for a cell from {width, minWidth, grow}. Sizing is
 *  emitted as custom properties so the container-query card layout can override
 *  it (inline `flex`/`width` would otherwise win over the stylesheet). */
function cellStyle(
  { width, minWidth, maxWidth, grow }: CellSizing,
  pinOffset?: string,
): CSSProperties {
  const style: Record<string, string> = {};
  if (grow) {
    // Flex column: grow shares free space, never shrinks below the floor.
    const floor = normalizeWidth(minWidth ?? width ?? 0);
    style['--cell-flex'] = `${grow} 0 ${floor}`;
    style['--cell-min-width'] = floor;
  } else {
    // Fixed column.
    const w = normalizeWidth(width);
    style['--cell-flex'] = `0 0 ${w}`;
    style['--cell-min-width'] = w;
  }
  if (maxWidth != null) style['--cell-max-width'] = normalizeWidth(maxWidth);
  if (pinOffset) style['--pin-start'] = pinOffset;
  return style as CSSProperties;
}

/** Drop sizing keys before spreading the remaining attrs onto the DOM node. */
function stripStyleProps<T extends CellSizing>(props: T): Omit<T, keyof CellSizing> {
  const { width: _width, minWidth: _minWidth, maxWidth: _maxWidth, grow: _grow, ...rest } = props;
  return rest;
}

function normalizeWidth(w: string | number | undefined): string {
  if (w == null) return '0';
  return typeof w === 'number' ? `${w}px` : w;
}
