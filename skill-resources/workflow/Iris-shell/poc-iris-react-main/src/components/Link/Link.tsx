import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx.js';
import styles from './Link.module.css';

export type LinkTone = 'brand' | 'danger';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  tone?: LinkTone;
  children?: ReactNode;
}

/**
 * Link — inline hyperlink styled with brand link tokens.
 */
export function Link({ href, tone = 'brand', children, className, ...rest }: LinkProps) {
  return (
    <a
      href={href}
      className={cx(styles.link, styles[`tone_${tone}`], className)}
      {...rest}
    >
      {children}
    </a>
  );
}
