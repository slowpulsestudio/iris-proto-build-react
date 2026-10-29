import { type Ref } from 'react';
import { cx } from '../../lib/cx.js';
import { Button } from '../Button/Button.js';
import { IconButton } from '../IconButton/IconButton.js';
import { Menu, type MenuEntry } from '../Menu/Menu.js';
import { ConditionPill } from './ConditionPill.js';
import type { FilterModelActions } from './useFilterModel.js';
import { type BooleanOp, type Group, type ParameterDef } from './filterModel.js';
import styles from './AdvancedFilter.module.css';

/** Maximum group nesting (levels, 1-indexed: root = level 1). */
const MAX_LEVELS = 3;

/** A titled group of parameters for the `+ Filter` popover (e.g. Common / User). */
export interface ParamCategory {
  label: string;
  icon?: string;
  parameterIds: string[];
}

export interface AdvancedFilterProps {
  group: Group;
  parameters: ParameterDef[];
  categories: ParamCategory[];
  actions: FilterModelActions;
  /** Nesting depth (0 = top-level). */
  depth?: number;
  className?: string;
}

/** AND / OR toggle chip — scoped to a whole group. */
function BooleanConnector({ op, onChange }: { op: BooleanOp; onChange: (op: BooleanOp) => void }) {
  const next = op === 'and' ? 'or' : 'and';
  return (
    <button
      type="button"
      className={styles.connector}
      onClick={() => onChange(next)}
      aria-label={`Join with ${op.toUpperCase()} — switch to ${next.toUpperCase()}`}
    >
      {op.toUpperCase()}
    </button>
  );
}

/**
 * AdvancedFilter — recursive builder for a filter group: rows (conditions or
 * nested groups) joined by a group-scoped AND/OR connector, plus a `+ Filter`
 * popover offering `Add filter group` and the parameter categories. Rendered
 * inside the FilterBar dropdown popover; carries no chrome of its own.
 */
export function AdvancedFilter({
  group,
  parameters,
  categories,
  actions,
  depth = 0,
  className,
}: AdvancedFilterProps) {
  const isRoot = depth === 0;
  const paramById = new Map(parameters.map((p) => [p.id, p]));

  const categoryItems = (): MenuEntry[] =>
    categories.map((cat) => ({
      kind: 'submenu',
      label: cat.label,
      icon: cat.icon,
      items: cat.parameterIds
        .map((id) => paramById.get(id))
        .filter((p): p is ParameterDef => Boolean(p))
        .map((p) => ({
          kind: 'item',
          label: p.label,
          icon: p.icon,
          onSelect: () => actions.addCondition(group.id, { parameterId: p.id }),
        })),
    }));

  // A group can nest deeper only while it stays within the 3-level cap.
  const canNest = depth + 1 < MAX_LEVELS;
  const addMenuItems: MenuEntry[] = [
    ...(canNest
      ? ([
          {
            kind: 'item',
            label: 'Add filter group',
            icon: 'FunnelSimple',
            onSelect: () => actions.addGroup(group.id),
          },
          { kind: 'divider' },
        ] as MenuEntry[])
      : []),
    ...categoryItems(),
  ];

  const setOp = (op: BooleanOp) => actions.setOp(group.id, op);

  const body = (
    <div className={cx(styles.body, isRoot && className)}>
      {group.children.map((child, i) => (
        <div key={child.id} className={styles.row}>
          {i > 0 && <BooleanConnector op={group.op} onChange={setOp} />}
          {child.kind === 'condition' ? (
            <ConditionPill
              condition={child}
              parameters={parameters}
              onChange={(patch) => actions.updateCondition(child.id, patch)}
              onRemove={() => actions.remove(child.id)}
            />
          ) : (
            <>
              <AdvancedFilter
                group={child}
                parameters={parameters}
                categories={categories}
                actions={actions}
                depth={depth + 1}
              />
              <IconButton
                icon="X"
                ariaLabel="Remove group"
                size="s"
                variant="ghost"
                className={styles.groupRemove}
                onClick={() => actions.remove(child.id)}
              />
            </>
          )}
        </div>
      ))}

      <div className={styles.row}>
        {group.children.length > 0 && <BooleanConnector op={group.op} onChange={setOp} />}
        <Menu
          ariaLabel="Add filter"
          align="start"
          items={addMenuItems}
          trigger={({ ref, onClick, expanded }) => (
            <Button
              ref={ref as Ref<HTMLButtonElement>}
              variant="secondary"
              size="s"
              iconLead="Plus"
              aria-haspopup="menu"
              aria-expanded={expanded}
              onClick={onClick}
            >
              Filter
            </Button>
          )}
        />
      </div>
    </div>
  );

  if (!isRoot) {
    return <div className={cx(styles.nested, className)}>{body}</div>;
  }

  return body;
}
