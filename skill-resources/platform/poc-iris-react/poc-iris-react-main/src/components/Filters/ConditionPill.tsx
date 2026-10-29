import { type Ref } from 'react';
import { cx } from '../../lib/cx.js';
import { Icon } from '../Icon/Icon.js';
import { Menu, type MenuEntry } from '../Menu/Menu.js';
import { ValueEditor } from './ValueEditor.js';
import {
  OPERATORS,
  OPERATOR_BY_ID,
  type Condition,
  type ParameterDef,
} from './filterModel.js';
import styles from './ConditionPill.module.css';

export interface ConditionPillProps {
  condition: Condition;
  parameters: ParameterDef[];
  onChange: (patch: Partial<Omit<Condition, 'kind' | 'id'>>) => void;
  onRemove: () => void;
  className?: string;
}

/**
 * ConditionPill — one editable condition: `parameter · operator · value` with a
 * trailing remove. Parameter and operator open menus; the value segment is a
 * ValueEditor derived from the chosen parameter.
 */
export function ConditionPill({
  condition,
  parameters,
  onChange,
  onRemove,
  className,
}: ConditionPillProps) {
  const param = parameters.find((p) => p.id === condition.parameterId);
  const op = condition.operatorId ? OPERATOR_BY_ID[condition.operatorId] : undefined;

  const parameterItems: MenuEntry[] = parameters.map((p) => ({
    kind: 'item',
    label: p.label,
    icon: p.icon,
    selected: p.id === condition.parameterId,
    // Changing the parameter resets values (the value type may differ).
    onSelect: () => onChange({ parameterId: p.id, values: [] }),
  }));

  const operatorItems: MenuEntry[] = OPERATORS.map((o) => ({
    kind: 'item',
    label: o.label,
    icon: o.icon,
    selected: o.id === condition.operatorId,
    onSelect: () =>
      onChange(o.id === 'empty' ? { operatorId: 'empty', values: [] } : { operatorId: o.id }),
  }));

  return (
    <div className={cx(styles.pill, className)}>
      <Menu
        ariaLabel="Select a parameter"
        align="start"
        items={parameterItems}
        trigger={({ ref, onClick, expanded }) => (
          <button
            ref={ref as Ref<HTMLButtonElement>}
            type="button"
            className={cx(styles.seg, styles.segParam)}
            onClick={onClick}
            aria-haspopup="menu"
            aria-expanded={expanded}
          >
            {param ? (
              <>
                {param.icon && <Icon name={param.icon} size="16px" className={styles.segIcon} />}
                <span className={styles.segLabel}>{param.label}</span>
              </>
            ) : (
              <span className={styles.placeholder}>Parameter</span>
            )}
          </button>
        )}
      />

      <Menu
        ariaLabel="Select an operator"
        align="start"
        items={operatorItems}
        trigger={({ ref, onClick, expanded }) => (
          <button
            ref={ref as Ref<HTMLButtonElement>}
            type="button"
            className={cx(styles.seg, styles.segOp)}
            onClick={onClick}
            aria-haspopup="menu"
            aria-expanded={expanded}
          >
            {op ? (
              <>
                <Icon name={op.icon} size="16px" className={styles.segIcon} />
                <span className={styles.segLabel}>{op.label}</span>
              </>
            ) : (
              <span className={styles.placeholder}>Operator</span>
            )}
          </button>
        )}
      />

      <ValueEditor
        parameter={param}
        operatorId={condition.operatorId}
        values={condition.values}
        onChange={(values) => onChange({ values })}
        segClassName={cx(styles.seg, styles.segValue)}
        inputClassName={cx(styles.seg, styles.segValue, styles.valueInput)}
        placeholderClassName={styles.placeholder}
      />

      <button
        type="button"
        className={cx(styles.seg, styles.segRemove)}
        onClick={onRemove}
        aria-label={param ? `Remove ${param.label} condition` : 'Remove condition'}
      >
        <Icon name="X" size="16px" />
      </button>
    </div>
  );
}
