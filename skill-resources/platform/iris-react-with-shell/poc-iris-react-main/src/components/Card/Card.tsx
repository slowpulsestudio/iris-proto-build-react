import type { ReactNode } from 'react';
import { cx } from '../../lib/cx.js';
import styles from './Card.module.css';

export interface CardProps {
  /** Bold title text. */
  title?: string;
  /** Tertiary helper copy below the title. */
  helper?: string;
  /** Trailing slot in the header (e.g. an "Edit" button). */
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/**
 * Card — bordered content surface with optional header.
 */
export function Card({ title, helper, actions, children, className }: CardProps) {
  const hasHeader = title || helper || actions;
  return (
    <section className={cx(styles.card, className)}>
      {hasHeader && (
        <header className={styles.header}>
          <div className={styles.headerContent}>
            {title && <h3 className={styles.title}>{title}</h3>}
            {helper && <p className={styles.helper}>{helper}</p>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </header>
      )}
      <div className={styles.body}>{children}</div>
    </section>
  );
}
