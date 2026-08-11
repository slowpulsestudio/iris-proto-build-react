import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx.js';
import { Icon } from '../Icon/Icon.js';
import styles from './Badge.module.css';

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'error';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  /** Optional leading icon name. */
  icon?: string;
  children?: ReactNode;
}

/**
 * Badge — short status/category indicator.
 */
export function Badge({ tone = 'neutral', icon, className, children, ...rest }: BadgeProps) {
  return (
    <span className={cx(styles.badge, styles[`tone_${tone}`], className)} {...rest}>
      {icon && <Icon name={icon} size="12px" />}
      <span className={styles.label}>{children}</span>
    </span>
  );
}
