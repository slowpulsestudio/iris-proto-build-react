import type { HTMLAttributes } from 'react';
import { cx } from '../../lib/cx.js';
import styles from './Avatar.module.css';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  src?: string;
  /** Used for alt text and initials fallback. */
  name: string;
  size?: 's' | 'default' | 'l';
}

/**
 * Avatar — circular user avatar with image + initials fallback.
 */
export function Avatar({ src, name, size = 'default', className, ...rest }: AvatarProps) {
  const initials = getInitials(name);
  return (
    <span
      className={cx(styles.avatar, styles[`size_${size}`], className)}
      role="img"
      aria-label={name}
      {...rest}
    >
      {src ? (
        <img src={src} alt="" className={styles.img} />
      ) : (
        <span className={styles.initials}>{initials}</span>
      )}
    </span>
  );
}

function getInitials(name: string | undefined): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}
