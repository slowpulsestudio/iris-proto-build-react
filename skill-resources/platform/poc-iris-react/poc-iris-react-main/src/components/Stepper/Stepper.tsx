import { type ReactNode } from 'react';
import { cx } from '../../lib/cx.js';
import { Icon } from '../Icon/Icon.js';
import styles from './Stepper.module.css';

export type StepStatus = 'completed' | 'current' | 'upcoming' | 'error';

export interface StepperStepItem {
  /** Stable key, also used for aria wiring. */
  id: string;
  /** Visible step label. */
  label: ReactNode;
  /**
   * Explicit status override. When omitted, status is derived from
   * `activeIndex`: index < active → completed, === active → current,
   * otherwise upcoming. Use `'error'` to flag a failed step.
   */
  status?: StepStatus;
  /** Disables interaction for this step (still shown). */
  disabled?: boolean;
}

export interface StepperProps {
  steps: StepperStepItem[];
  /** Index of the current step; drives derived statuses. */
  activeIndex?: number;
  /** Only 'horizontal' is implemented; 'vertical' is reserved for a later pass. */
  orientation?: 'horizontal' | 'vertical';
  /** When true, non-disabled steps render as buttons and fire `onStepSelect`. */
  interactive?: boolean;
  onStepSelect?: (index: number, step: StepperStepItem) => void;
  /** Accessible label for the step list. */
  ariaLabel?: string;
  className?: string;
}

const STATUS_LABEL: Record<StepStatus, string> = {
  completed: 'completed',
  current: 'current',
  upcoming: 'upcoming',
  error: 'error',
};

const STATUS_CLASS: Record<StepStatus, string> = {
  completed: styles.completed,
  current: styles.current,
  upcoming: styles.upcoming,
  error: styles.error,
};

/** Derive a step's visual status from its explicit override or the active index. */
function resolveStatus(item: StepperStepItem, index: number, activeIndex: number): StepStatus {
  if (item.status) return item.status;
  if (index < activeIndex) return 'completed';
  if (index === activeIndex) return 'current';
  return 'upcoming';
}

/**
 * Stepper — linear, ordered progress indicator.
 *
 *   <Stepper
 *     activeIndex={1}
 *     steps={[
 *       { id: 'a', label: 'Details' },
 *       { id: 'b', label: 'Review' },
 *       { id: 'c', label: 'Confirm' },
 *     ]}
 *   />
 *
 * Horizontal orientation only for now; the API reserves `orientation` so a
 * vertical variant can be added without breaking callers.
 */
export function Stepper({
  steps,
  activeIndex = 0,
  orientation = 'horizontal',
  interactive = false,
  onStepSelect,
  ariaLabel = 'Progress',
  className,
}: StepperProps) {
  if (orientation === 'vertical' && import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn('<Stepper orientation="vertical" /> is not implemented yet; rendering horizontal.');
  }

  return (
    <ol className={cx(styles.root, styles.horizontal, className)} aria-label={ariaLabel}>
      {steps.map((item, index) => {
        const status = resolveStatus(item, index, activeIndex);
        const isCurrent = status === 'current' || (status === 'error' && index === activeIndex);

        return (
          <li
            key={item.id}
            className={cx(styles.step, STATUS_CLASS[status], isCurrent && styles.isCurrent)}
            aria-current={isCurrent ? 'step' : undefined}
          >
            {interactive ? (
              <button
                type="button"
                className={styles.stepInner}
                disabled={item.disabled}
                onClick={() => onStepSelect?.(index, item)}
              >
                <StepBody status={status} position={index + 1} label={item.label} />
              </button>
            ) : (
              <div className={styles.stepInner} aria-disabled={item.disabled || undefined}>
                <StepBody status={status} position={index + 1} label={item.label} />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

interface StepBodyProps {
  status: StepStatus;
  position: number;
  label: ReactNode;
}

function StepBody({ status, position, label }: StepBodyProps) {
  return (
    <>
      <span className={styles.connector} aria-hidden="true" />
      <span className={styles.indicator} aria-hidden="true">
        {status === 'completed' ? (
          <span className={styles.checkGlyph}>
            <Icon name="Check" size="10px" />
          </span>
        ) : status === 'error' ? (
          <span className={styles.errorGlyph}>!</span>
        ) : (
          <span className={styles.num}>{position}</span>
        )}
      </span>
      <span className={styles.label}>
        {label}
        <span className={styles.srStatus}>, {STATUS_LABEL[status]}</span>
      </span>
    </>
  );
}
