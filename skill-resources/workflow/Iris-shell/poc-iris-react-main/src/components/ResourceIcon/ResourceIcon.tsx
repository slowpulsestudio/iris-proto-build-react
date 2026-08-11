import { cx } from '../../lib/cx.js';
import { Icon } from '../Icon/Icon.js';
import styles from './ResourceIcon.module.css';

export interface ResourceIconProps {
  /** Icon name to render. */
  icon: string;
  /** Tile size. */
  size?: 'default' | 'l';
  /** Override the inner glyph size (e.g. '20px'). Defaults to the tile size. */
  iconSize?: string;
  className?: string;
  ariaLabel?: string;
}

/**
 * ResourceIcon — bordered, pill-shaped tile that frames a resource glyph
 * (used as the avatar-equivalent for non-people entities like users-in-list,
 * folders, or applications).
 */
export function ResourceIcon({ icon, size = 'l', iconSize, className, ariaLabel }: ResourceIconProps) {
  const glyphSize = iconSize ?? (size === 'l' ? '24px' : '20px');
  return (
    <span
      className={cx(styles.tile, styles[`size_${size}`], className)}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      <Icon name={icon} size={glyphSize} />
    </span>
  );
}
