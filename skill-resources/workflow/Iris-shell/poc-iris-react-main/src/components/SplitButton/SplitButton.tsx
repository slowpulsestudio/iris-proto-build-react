import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx.js';
import { Button } from '../Button/Button.js';
import { Icon } from '../Icon/Icon.js';
import styles from './SplitButton.module.css';

export interface SplitButtonProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'onClick'> {
  onClick?: () => void;
  onMenuClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 's' | 'default' | 'l';
  /** Icon name rendered before the label. */
  iconLead?: string;
  /** Main button label. */
  children?: ReactNode;
  ariaMenuLabel?: string;
  /** Whether the caller's menu is open — rotates the chevron when true. */
  expanded?: boolean;
}

/**
 * SplitButton — primary action paired with a chevron that opens a menu.
 *
 * The menu trigger is exposed via `onMenuClick`; the menu itself is the
 * caller's responsibility (this is a low-level component).
 */
export function SplitButton({
  onClick,
  onMenuClick,
  variant = 'primary',
  size = 'default',
  iconLead,
  className,
  children,
  ariaMenuLabel = 'More options',
  expanded,
  ...rest
}: SplitButtonProps) {
  return (
    <span className={cx(styles.root, className)} {...rest}>
      <Button
        variant={variant}
        size={size}
        iconLead={iconLead}
        onClick={onClick}
        className={styles.main}
      >
        {children}
      </Button>
      <button
        type="button"
        onClick={onMenuClick}
        aria-label={ariaMenuLabel}
        aria-expanded={expanded}
        className={cx(
          styles.split,
          styles[`variant_${variant}`],
          styles[`size_${size}`],
        )}
      >
        <Icon name="CaretDown" size="16px" className={styles.caret} />
      </button>
    </span>
  );
}
