import type { ReactNode } from 'react';
import { cx } from '../../lib/cx.js';
import styles from './DescriptionList.module.css';

export interface DescriptionListItem {
  label: string;
  value: ReactNode;
}

export interface DescriptionListProps {
  items: DescriptionListItem[];
  className?: string;
}

/**
 * DescriptionList — `<dl>` rendered as a two-column grid (label / value).
 */
export function DescriptionList({ items, className }: DescriptionListProps) {
  return (
    <dl className={cx(styles.list, className)}>
      {items.map((item, i) => (
        <div key={`${i}-${item.label}`} className={styles.row}>
          <dt className={styles.term}>{item.label}</dt>
          <dd className={styles.desc}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
