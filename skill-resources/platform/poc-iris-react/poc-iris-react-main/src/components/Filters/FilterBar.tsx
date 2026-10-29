import { useEffect, useRef, useState, type Ref } from 'react';
import { cx } from '../../lib/cx.js';
import { Icon } from '../Icon/Icon.js';
import { IconButton } from '../IconButton/IconButton.js';
import { Menu, type MenuEntry } from '../Menu/Menu.js';
import { ConditionPill } from './ConditionPill.js';
import { AdvancedFilter, type ParamCategory } from './AdvancedFilter.js';
import type { FilterModelActions } from './useFilterModel.js';
import {
  OPERATOR_BY_ID,
  countConditions,
  firstCondition,
  type Group,
  type ParameterDef,
} from './filterModel.js';
import pill from './ConditionPill.module.css';
import styles from './FilterBar.module.css';

export interface FilterBarProps {
  root: Group;
  parameters: ParameterDef[];
  categories: ParamCategory[];
  actions: FilterModelActions;
  /** Menu shown by the trailing ghost `+` button (add filters from the bar). */
  addMenuItems?: MenuEntry[];
  className?: string;
}

function valueText(param: ParameterDef | undefined, values: string[]): string {
  if (values.length === 0) return '';
  if (param?.options) {
    return values.map((v) => param.options?.find((o) => o.value === v)?.label ?? v).join(', ');
  }
  return values.join(', ');
}

/**
 * GroupPill — one advanced-filter group in the bar. Shows an "Advanced filter"
 * pill (a lead-condition summary when collapsed) and opens a floating dropdown
 * popover that hosts the entire nested builder.
 */
function GroupPill({
  group,
  parameters,
  categories,
  actions,
  onRemove,
}: {
  group: Group;
  parameters: ParameterDef[];
  categories: ParamCategory[];
  actions: FilterModelActions;
  onRemove: () => void;
}) {
  // A freshly-added (empty) group opens straight into the builder.
  const [open, setOpen] = useState(() => group.children.length === 0);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Element | null;
      // Nested Menu / MultiSelect popovers portal outside this wrapper; clicks
      // inside them must not dismiss the builder.
      if (target?.closest?.('[data-oi-menu], [role="listbox"]')) return;
      if (wrapRef.current && !wrapRef.current.contains(target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // Let an open nested Menu / MultiSelect consume Escape first.
      if (document.querySelector('[data-oi-menu], [role="listbox"]')) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const lead = firstCondition(group);
  const extra = Math.max(0, countConditions(group) - 1);
  const param = lead ? parameters.find((p) => p.id === lead.parameterId) : undefined;
  const op = lead?.operatorId ? OPERATOR_BY_ID[lead.operatorId] : undefined;
  const value = lead ? valueText(param, lead.values) : '';
  const more = extra === 1 ? '1 more condition' : `${extra} more conditions`;
  // Summarise the lead condition live — even while the builder is open — but only
  // once it has a parameter, so a just-added empty condition keeps the label.
  const showSummary = Boolean(param);

  const toggle = () => setOpen((o) => !o);

  return (
    <div ref={wrapRef} className={styles.groupWrap}>
      <div className={pill.pill}>
        <div
          className={styles.trigger}
          role="button"
          tabIndex={0}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={showSummary ? undefined : 'Advanced filter'}
          onClick={toggle}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggle();
            }
          }}
        >
          {showSummary ? (
            <>
              {param && (
                <span className={pill.seg}>
                  {param.icon && (
                    <Icon name={param.icon} size="16px" className={pill.segIcon} />
                  )}
                  <span className={pill.segLabel}>{param.label}</span>
                </span>
              )}
              {op && (
                <span className={cx(pill.seg, pill.segOp)}>
                  <Icon name={op.icon} size="16px" className={pill.segIcon} />
                  <span className={pill.segLabel}>{op.label}</span>
                </span>
              )}
              {value && (
                <span className={pill.seg}>
                  <span className={pill.segLabel}>{value}</span>
                </span>
              )}
              {extra > 0 && (
                <span className={cx(pill.seg, styles.moreSeg)}>
                  <span className={styles.moreConnector}>{group.op}</span> {more}
                </span>
              )}
            </>
          ) : (
            <span className={pill.seg}>
              <Icon name="FunnelSimple" size="16px" className={pill.segIcon} />
              <span className={pill.segLabel}>Advanced filter</span>
            </span>
          )}
        </div>
        <button
          type="button"
          className={cx(pill.seg, pill.segRemove)}
          onClick={onRemove}
          aria-label="Remove advanced filter"
        >
          <Icon name="X" size="16px" />
        </button>
      </div>

      {open && (
        <div className={styles.popover} role="dialog" aria-label="Advanced filter">
          <AdvancedFilter
            group={group}
            parameters={parameters}
            categories={categories}
            actions={actions}
          />
        </div>
      )}
    </div>
  );
}

/**
 * FilterBar — the active-filter band beneath the toolbar. Each top-level node
 * renders as an editable condition pill or an advanced group (a pill that opens
 * the builder in a dropdown popover). Renders nothing when there are no filters.
 */
export function FilterBar({ root, parameters, categories, actions, addMenuItems, className }: FilterBarProps) {
  const barRef = useRef<HTMLDivElement | null>(null);
  const prevCount = useRef(0);

  const count = root.children.length;
  useEffect(() => {
    if (prevCount.current === 0 && count > 0) barRef.current?.focus();
    prevCount.current = count;
  }, [count]);

  if (count === 0) return null;

  return (
    <div
      ref={barRef}
      className={cx(styles.bar, className)}
      role="region"
      aria-label="Active filters"
      tabIndex={-1}
    >
      {root.children.map((child) =>
        child.kind === 'condition' ? (
          <ConditionPill
            key={child.id}
            condition={child}
            parameters={parameters}
            onChange={(patch) => actions.updateCondition(child.id, patch)}
            onRemove={() => actions.remove(child.id)}
          />
        ) : (
          <GroupPill
            key={child.id}
            group={child}
            parameters={parameters}
            categories={categories}
            actions={actions}
            onRemove={() => actions.remove(child.id)}
          />
        ),
      )}
      {addMenuItems && addMenuItems.length > 0 && (
        <Menu
          ariaLabel="Add filter"
          align="start"
          items={addMenuItems}
          trigger={({ ref, onClick, expanded }) => (
            <IconButton
              ref={ref as Ref<HTMLButtonElement>}
              icon="Plus"
              ariaLabel="Add filter"
              size="s"
              variant="ghost"
              className={styles.addGhost}
              aria-haspopup="menu"
              aria-expanded={expanded}
              onClick={onClick}
            />
          )}
        />
      )}
    </div>
  );
}
