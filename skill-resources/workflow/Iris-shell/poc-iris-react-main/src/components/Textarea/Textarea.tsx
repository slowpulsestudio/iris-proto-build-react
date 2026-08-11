import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cx } from '../../lib/cx.js';
import styles from './Textarea.module.css';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Error state (red border + `aria-invalid`). */
  invalid?: boolean;
  rows?: number;
}

/**
 * Textarea — multi-line text field that mirrors `TextInput`'s look & feel.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid = false, rows = 4, className, id, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      id={id}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cx(styles.textarea, invalid && styles.invalid, className)}
      {...rest}
    />
  );
});
