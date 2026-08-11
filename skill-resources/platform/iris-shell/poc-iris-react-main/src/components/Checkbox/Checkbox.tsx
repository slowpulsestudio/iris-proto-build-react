import { forwardRef, type InputHTMLAttributes } from 'react';
import { cx } from '../../lib/cx.js';
import styles from './Checkbox.module.css';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  ariaLabel?: string;
}

/**
 * Checkbox — controlled tri-state checkbox.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { checked = false, indeterminate = false, onChange, ariaLabel, className, ...rest },
  ref,
) {
  return (
    <span className={cx(styles.wrap, className)}>
      <input
        ref={(el) => {
          if (el) el.indeterminate = indeterminate;
          if (typeof ref === 'function') ref(el);
          else if (ref) (ref as { current: HTMLInputElement | null }).current = el;
        }}
        type="checkbox"
        checked={checked}
        aria-label={ariaLabel}
        onChange={(e) => onChange?.(e.target.checked)}
        className={styles.input}
        {...rest}
      />
      <span
        className={cx(
          styles.box,
          checked && styles.checked,
          indeterminate && styles.indeterminate,
        )}
        aria-hidden="true"
      >
        {indeterminate ? (
          <svg viewBox="0 0 16 16" className={styles.mark}>
            <path d="M3.5 8h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" className={styles.mark}>
            <path
              className={styles.checkPath}
              d="M3.5 8.5l3 3 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        )}
      </span>
    </span>
  );
});
