import { cx } from '../../lib/cx.js';
import { Icon } from '../Icon/Icon.js';
import styles from './NavItem.module.css';

export interface NavItemProps {
  /** Icon name. */
  icon: string;
  label: string;
  selected?: boolean;
  /** If provided, renders as `<a>`. */
  href?: string;
  onClick?: () => void;
  className?: string;
  /** Suppress the built-in active bar (parent renders a shared sliding one). */
  hideIndicator?: boolean;
}

/**
 * NavItem — single row in a sidebar nav list.
 */
export function NavItem({
  icon,
  label,
  selected = false,
  href,
  onClick,
  className,
  hideIndicator = false,
}: NavItemProps) {
  const commonProps = {
    'aria-current': selected ? ('page' as const) : undefined,
    className: cx(styles.item, selected && styles.selected, className),
  };
  if (href) {
    return (
      <a href={href} {...commonProps}>
        <span className={styles.iconWrap} aria-hidden="true">
          <Icon name={icon} size="16px" />
        </span>
        <span className={styles.label}>{label}</span>
        {selected && !hideIndicator && (
          <span className={styles.indicator} aria-hidden="true" />
        )}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} {...commonProps}>
      <span className={styles.iconWrap} aria-hidden="true">
        <Icon name={icon} size="16px" />
      </span>
      <span className={styles.label}>{label}</span>
      {selected && !hideIndicator && (
        <span className={styles.indicator} aria-hidden="true" />
      )}
    </button>
  );
}
