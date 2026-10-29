import { useMemo, type Ref } from 'react';
import { MultiSelect } from '../MultiSelect/MultiSelect.js';
import { operatorTakesValue, type OperatorId, type ParameterDef } from './filterModel.js';

export interface ValueEditorProps {
  parameter?: ParameterDef;
  operatorId?: OperatorId;
  values: string[];
  onChange: (values: string[]) => void;
  /** Class for the clickable value segment (enum trigger). */
  segClassName?: string;
  /** Class for inline inputs (text / date). */
  inputClassName?: string;
  placeholderClassName?: string;
}

/**
 * ValueEditor — renders the value segment of a condition pill. The control is
 * derived from the parameter: a date input for date params, a multi-select for
 * enum params (with options), and a text box otherwise. Renders nothing when
 * the operator carries no value (`is empty`).
 */
export function ValueEditor({
  parameter,
  operatorId,
  values,
  onChange,
  segClassName,
  inputClassName,
  placeholderClassName,
}: ValueEditorProps) {
  const optionLabel = useMemo(() => {
    const map = new Map<string, string>();
    for (const o of parameter?.options ?? []) map.set(o.value, o.label);
    return map;
  }, [parameter]);

  // `is empty` (and any operator with no value) shows no value segment.
  if (!operatorTakesValue(operatorId)) return null;

  // Value can't be set before a parameter is chosen.
  if (!parameter) {
    return <span className={placeholderClassName}>Value</span>;
  }

  if (parameter.date) {
    return (
      <input
        type="date"
        className={inputClassName}
        value={values[0] ?? ''}
        onChange={(e) => onChange(e.target.value ? [e.target.value] : [])}
        aria-label={`${parameter.label} value`}
      />
    );
  }

  if (parameter.options && parameter.options.length > 0) {
    const selected = new Set(values);
    const joined = values.map((v) => optionLabel.get(v) ?? v).join(', ');
    return (
      <MultiSelect
        options={parameter.options.map((o) => ({ value: o.value, title: o.label, icon: o.icon }))}
        selected={selected}
        onSelectionChange={(next) => onChange([...next])}
        label={parameter.label}
        align="start"
        ariaLabel={`${parameter.label} value`}
        renderTrigger={({ ref, onClick, expanded }) => (
          <button
            ref={ref as Ref<HTMLButtonElement>}
            type="button"
            className={segClassName}
            onClick={onClick}
            aria-haspopup="listbox"
            aria-expanded={expanded}
          >
            {joined ? (
              <span>{joined}</span>
            ) : (
              <span className={placeholderClassName}>Value</span>
            )}
          </button>
        )}
      />
    );
  }

  return (
    <input
      type="text"
      className={inputClassName}
      value={values[0] ?? ''}
      placeholder="Value"
      onChange={(e) => onChange(e.target.value ? [e.target.value] : [])}
      aria-label={`${parameter.label} value`}
    />
  );
}
