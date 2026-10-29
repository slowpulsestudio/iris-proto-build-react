import { type ComponentType, type ReactNode } from 'react';
import type { HairlineProps } from '@lucasmarkes/hairline/react';
import { cx } from '../../lib/cx.js';
import styles from './EmptyFigure.module.css';

export interface EmptyFigureProps {
  /** A Hairline figure component, e.g. `Branches` from `@lucasmarkes/hairline/react`. */
  figure: ComponentType<HairlineProps>;
  /** Heading shown below the figure. Omit for a figure-only surface. */
  title?: string;
  /** Supporting copy shown below the title. */
  description?: string;
  /** Accessible name for the figure. Falls back to `title`. */
  label?: string;
  /** Pointer responsiveness, 0 (subtle) to 1 (strong). Defaults to Hairline's 0.5. */
  intensity?: number;
  /** Optional call-to-action rendered below the copy. */
  action?: ReactNode;
  className?: string;
}

/**
 * EmptyFigure — shared empty-state surface that pairs a themed Hairline figure
 * with a title/description. Hairline's colours are driven by theme tokens in
 * the module CSS, so the figure recolours with the active theme.
 */
export function EmptyFigure({
  figure: Figure,
  title,
  description,
  label,
  intensity,
  action,
  className,
}: EmptyFigureProps) {
  return (
    <div className={cx(styles.root, className)}>
      <Figure
        className={styles.figure}
        label={label ?? title}
        intensity={intensity}
      />
      {(title || description) && (
        <div className={styles.text}>
          {title && <p className={styles.title}>{title}</p>}
          {description && <p className={styles.description}>{description}</p>}
        </div>
      )}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
