import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../lib/cx.js';
import { Icon } from '../Icon/Icon.js';
import styles from './IconButton.module.css';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  /** Manifest icon name (string) OR a custom inline SVG node. */
  icon: string | ReactNode;
  ariaLabel: string;
  variant?: 'ghost' | 'secondary';
  size?: 's' | 'default' | 'l';
}

/**
 * IconButton — square button containing a single icon.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    icon,
    ariaLabel,
    variant = 'ghost',
    size = 'default',
    type = 'button',
    className,
    ...rest
  },
  ref,
) {
  const iconSize = size === 's' ? '16px' : size === 'l' ? '24px' : '20px';
  return (
    <button
      ref={ref}
      type={type}
      aria-label={ariaLabel}
      className={cx(styles.btn, styles[`variant_${variant}`], styles[`size_${size}`], className)}
      {...rest}
    >
      {typeof icon === 'string' ? <Icon name={icon} size={iconSize} /> : icon}
    </button>
  );
});
