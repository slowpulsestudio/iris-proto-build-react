import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../lib/cx.js';
import { IconButton } from '../IconButton/IconButton.js';
import styles from './SideSheet.module.css';

export interface SideSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children?: ReactNode;
  footer?: ReactNode;
  /** Override aria-labelledby with a literal label. */
  ariaLabel?: string;
  className?: string;
}

/**
 * SideSheet — right-docked overlay panel that animates in over a scrim.
 *
 * Behaviour:
 *   - Closes on Esc, scrim click, or close button.
 *   - Locks body scroll while open.
 *   - Traps Tab focus inside the panel.
 *   - Returns focus to the element that was active before opening.
 *   - Slide-out animation plays before unmount (~200ms).
 */
export function SideSheet({
  open,
  onClose,
  title,
  subtitle,
  onBack,
  children,
  footer,
  ariaLabel,
  className,
}: SideSheetProps) {
  const [mounted, setMounted] = useState(open);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();

  // Stash the latest onClose in a ref so the focus-trap effect (below) can
  // call it without listing `onClose` as a dependency. Callers commonly pass
  // an inline arrow, which would otherwise tear down + re-run the effect on
  // every parent render — losing focus and momentarily restoring body scroll.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Mount immediately; defer unmount until the exit animation completes.
  useEffect(() => {
    if (open) {
      setMounted(true);
      return undefined;
    }
    const t = setTimeout(() => setMounted(false), 200);
    return () => clearTimeout(t);
  }, [open]);

  // Esc closes; focus trap + return focus on unmount.
  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;

    // Body-scroll lock.
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((el) => !el.hasAttribute('disabled'));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = originalOverflow;
      // Return focus to the trigger element.
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, [open]);

  // Initial focus. Runs once the panel is actually mounted in the DOM (the
  // panel isn't rendered on the same tick `open` flips true — `mounted` lags
  // by a render). Prefer the first focusable inside the body (typically the
  // first form field) so the sheet lands on content rather than the header
  // close button; fall back to the first focusable anywhere in the panel.
  useEffect(() => {
    if (!open || !mounted) return undefined;
    const focusTimer = requestAnimationFrame(() => {
      const first =
        bodyRef.current?.querySelector<HTMLElement>(focusableSelector) ??
        panelRef.current?.querySelector<HTMLElement>(focusableSelector);
      first?.focus();
    });
    return () => cancelAnimationFrame(focusTimer);
  }, [open, mounted]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={cx(styles.root, open && styles.rootOpen)}
      // Scrim click closes; clicks inside panel stopPropagation below.
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabel ? undefined : titleId}
        aria-label={ariaLabel}
        className={cx(styles.panel, open && styles.panelOpen, className)}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          {onBack && (
            <IconButton icon="ArrowLeft" ariaLabel="Back" onClick={onBack} />
          )}
          <div className={styles.headerText}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          <IconButton icon="X" ariaLabel="Close" onClick={onClose} />
        </header>

        <div ref={bodyRef} className={styles.body}>{children}</div>

        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');
