import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../lib/cx.js';
import { Icon } from '../Icon/Icon.js';
import styles from './Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 's' | 'default' | 'l';
  /** Icon name to render before the label. */
  iconLead?: string;
  /** Icon name to render after the label. */
  iconTrail?: string;
  /** Render as a square icon button. */
  iconOnly?: boolean;
  children?: ReactNode;
}

/**
 * Button — primary action element.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'default',
    iconLead,
    iconTrail,
    iconOnly = false,
    type = 'button',
    className,
    children,
    ...rest
  },
  ref,
) {
  const iconSize = size === 's' ? '16px' : '20px';
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        styles.btn,
        styles[`variant_${variant}`],
        styles[`size_${size}`],
        iconOnly && styles.iconOnly,
        className,
      )}
      {...rest}
    >
      {iconLead && <Icon name={iconLead} size={iconSize} />}
      {!iconOnly && children != null && <span className={styles.label}>{children}</span>}
      {iconOnly && children}
      {iconTrail && <Icon name={iconTrail} size={iconSize} />}
    </button>
  );
});
