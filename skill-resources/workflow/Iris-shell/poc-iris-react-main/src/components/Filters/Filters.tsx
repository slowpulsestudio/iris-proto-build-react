import { useEffect, useRef, type Ref } from 'react';
import { cx } from '../../lib/cx.js';
import { Icon } from '../Icon/Icon.js';
import { Menu, type MenuEntry } from '../Menu/Menu.js';
import styles from './Filters.module.css';

/** A selectable value for a filter field (e.g. an object type). */
export interface FilterOption {
  value: string;
  label: string;
  /** Named icon from the shared manifest (uses `currentColor`). */
  icon?: string;
}

/** Definition of a filterable field, used to build the value + add menus. */
export interface FilterFieldConfig {
  id: string;
  label: string;
  /**
   * How the value is chosen. `'select'` (default) opens a menu of `options`;
   * `'date'` renders a native date picker in the chip.
   */
  type?: 'select' | 'date';
  /** Rule shown in the chip's pill (defaults to "is"). */
  rule?: string;
  /** Placeholder shown while no value is chosen (defaults to "Select value"). */
  placeholder?: string;
  /** Values the user can pick from. Used when `type` is `'select'`. */
  options?: FilterOption[];
}

/** An active filter instance rendered as a chip. */
export interface ActiveFilter {
  id: string;
  fieldId: string;
  value?: string;
}

/**
 * A field can be configured only if it has a value-selection UI: a `date`
 * picker, or a `select` with at least one option.
 */
export function fieldHasValueUi(field: FilterFieldConfig): boolean {
  return field.type === 'date' || (field.options?.length ?? 0) > 0;
}

export interface FiltersProps {
  filters: ActiveFilter[];
  fields: FilterFieldConfig[];
  /** Add a new filter chip for the given field id. */
  onAddFilter: (fieldId: string) => void;
  /** Set the chosen value on an existing filter chip. */
  onValueChange: (filterId: string, value: string) => void;
  /** Remove a single filter chip. */
  onRemove: (filterId: string) => void;
  /** Remove all filter chips. */
  onClear: () => void;
  className?: string;
}

/**
 * Filters — the filter bar shown below the toolbar once one or more filters
 * are active. Each chip has a remove segment and a body that opens a value
 * menu; the "Add Filter" control reopens the field menu and "Clear selection"
 * removes everything. Renders nothing when there are no active filters.
 */
export function Filters({
  filters,
  fields,
  onAddFilter,
  onValueChange,
  onRemove,
  onClear,
  className,
}: FiltersProps) {
  // The bar renders only when there's at least one active filter. Move focus
  // to it on the 0 → >0 transition (rather than on mount) so the filters
  // landmark is focused the moment it appears — even if this component was
  // mounted earlier while empty, when `barRef` would still be null.
  const barRef = useRef<HTMLDivElement | null>(null);
  const prevCount = useRef(0);
  useEffect(() => {
    if (prevCount.current === 0 && filters.length > 0) {
      barRef.current?.focus();
    }
    prevCount.current = filters.length;
  }, [filters.length]);

  if (filters.length === 0) return null;

  const fieldById = new Map(fields.map((f) => [f.id, f]));

  const addItems: MenuEntry[] = fields.map((f) => {
    // Only fields with a value-selection UI can be meaningfully configured, so
    // disable the rest until their UI exists.
    const supported = fieldHasValueUi(f);
    return {
      kind: 'item',
      label: f.label,
      disabled: !supported,
      onSelect: supported ? () => onAddFilter(f.id) : undefined,
    };
  });

  return (
    <div
      ref={barRef}
      className={cx(styles.filters, className)}
      role="region"
      aria-label="Active filters"
      tabIndex={-1}
    >
      <div className={styles.left}>
        {filters.map((filter) => {
          const field = fieldById.get(filter.fieldId);
          if (!field) return null;

          const rule = field.rule ?? 'is';
          const placeholder = field.placeholder ?? 'Select value';
          const isDate = field.type === 'date';
          const selected = field.options?.find((o) => o.value === filter.value);
          const hasMenu = !isDate && (field.options?.length ?? 0) > 0;

          const valueItems: MenuEntry[] = (field.options ?? []).map((o) => ({
            kind: 'item',
            label: o.label,
            icon: o.icon,
            selected: o.value === filter.value,
            onSelect: () => onValueChange(filter.id, o.value),
          }));

          const chipHeader = (
            <>
              <span className={styles.fieldLabel}>{field.label}</span>
              <span className={styles.rulePill}>{rule}</span>
            </>
          );

          const selectBody = (
            args?: { ref: Ref<HTMLElement>; onClick: () => void; expanded: boolean },
          ) => (
            <button
              ref={args?.ref as Ref<HTMLButtonElement>}
              type="button"
              className={styles.chipBody}
              onClick={args?.onClick}
              aria-haspopup={hasMenu ? 'menu' : undefined}
              aria-expanded={args?.expanded}
            >
              {chipHeader}
              {selected ? (
                <span className={styles.value}>
                  {selected.icon && <Icon name={selected.icon} size="16px" />}
                  <span className={styles.valueLabel}>{selected.label}</span>
                </span>
              ) : (
                <span className={styles.valuePlaceholder}>{placeholder}</span>
              )}
            </button>
          );

          return (
            <div key={filter.id} className={styles.chip}>
              <button
                type="button"
                className={styles.chipRemove}
                onClick={() => onRemove(filter.id)}
                aria-label={`Remove ${field.label} filter`}
              >
                <Icon name="X" size="16px" />
              </button>
              {isDate ? (
                <div className={styles.chipBody}>
                  {chipHeader}
                  <input
                    type="date"
                    className={styles.dateInput}
                    value={filter.value ?? ''}
                    onChange={(e) => onValueChange(filter.id, e.target.value)}
                    aria-label={`${field.label} value`}
                  />
                </div>
              ) : hasMenu ? (
                <Menu
                  ariaLabel={`${field.label} value`}
                  align="start"
                  items={valueItems}
                  trigger={(triggerArgs) => selectBody(triggerArgs)}
                />
              ) : (
                selectBody()
              )}
            </div>
          );
        })}

        <Menu
          ariaLabel="Add filter"
          align="start"
          items={addItems}
          trigger={({ ref, onClick, expanded }) => (
            <button
              ref={ref as Ref<HTMLButtonElement>}
              type="button"
              className={styles.ghostBtn}
              onClick={onClick}
              aria-haspopup="menu"
              aria-expanded={expanded}
            >
              <Icon name="PlusSquare" size="16px" />
              <span>Add</span>
            </button>
          )}
        />
      </div>

      <button type="button" className={styles.ghostBtn} onClick={onClear}>
        <Icon name="XCircle" size="16px" />
        <span>Clear</span>
      </button>
    </div>
  );
}
