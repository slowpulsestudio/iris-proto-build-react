import type { ButtonHTMLAttributes } from 'react';
import { cx } from '../../lib/cx.js';
import { Icon } from '../Icon/Icon.js';
import styles from './Select.module.css';

export interface SelectProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Currently selected label. */
  label: string;
  size?: 's' | 'default' | 'l';
}

/**
 * Select — non-interactive (display-only) form field that mirrors the Iris
 * dropdown trigger styling. Opens nothing — wire a menu separately when needed.
 */
export function Select({ label, onClick, size = 'default', className, ...rest }: SelectProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(styles.trigger, styles[`size_${size}`], className)}
      {...rest}
    >
      <span className={styles.label}>{label}</span>
      <Icon name="CaretDown" size="16px" className={styles.caret} />
    </button>
  );
}
