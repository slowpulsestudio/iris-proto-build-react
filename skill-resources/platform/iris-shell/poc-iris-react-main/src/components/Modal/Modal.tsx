import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../lib/cx.js';
import { Icon } from '../Icon/Icon.js';
import { IconButton } from '../IconButton/IconButton.js';
import styles from './Modal.module.css';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Secondary line under the title (e.g. user name). */
  subtitle?: ReactNode;
  /** Optional decorative element at the start of the header. A string is
   *  rendered as an {@link Icon}; any other node is rendered as-is. */
  leadingIcon?: ReactNode;
  /** Where the leading icon sits relative to the title.
   *  `inline` (default) = left of the title; `top` = stacked above it. */
  iconPlacement?: 'inline' | 'top';
  /** Width preset. `m` (default) = 620px per spec. */
  size?: 's' | 'm' | 'l';
  children?: ReactNode;
  /** Footer slot — usually a row of Buttons. */
  footer?: ReactNode;
  /** Element to focus when the modal opens. Defaults to the first focusable
   *  element in the dialog (usually the close button). */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Override aria-labelledby with a literal label. */
  ariaLabel?: string;
  className?: string;
}

/**
 * Modal — centered dialog with scrim. Closes on ESC, scrim click, or X.
 * Traps Tab focus, locks body scroll, restores focus on unmount.
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  leadingIcon,
  iconPlacement = 'inline',
  size = 'm',
  children,
  footer,
  initialFocusRef,
  ariaLabel,
  className,
}: ModalProps) {
  const [mounted, setMounted] = useState(open);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();

  // Stash the latest onClose in a ref so the focus-trap effect (below) can
  // call it without listing `onClose` as a dependency. Callers commonly pass
  // an inline arrow, which would otherwise tear down + re-run the effect on
  // every parent render — losing focus and momentarily restoring body scroll.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return undefined;
    }
    const t = setTimeout(() => setMounted(false), 200);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = requestAnimationFrame(() => {
      const target =
        initialFocusRef?.current ??
        dialogRef.current?.querySelector<HTMLElement>(focusableSelector);
      target?.focus();
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusables = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      );
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
      cancelAnimationFrame(focusTimer);
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, [open, initialFocusRef]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={cx(styles.root, open && styles.rootOpen)}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabel ? undefined : titleId}
        aria-label={ariaLabel}
        className={cx(styles.dialog, styles[`size_${size}`], open && styles.dialogOpen, className)}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={cx(styles.header, iconPlacement === 'top' && styles.headerStacked)}>
          {leadingIcon && (
            <span className={styles.headerIcon} aria-hidden="true">
              {typeof leadingIcon === 'string' ? (
                <Icon name={leadingIcon} size="24px" />
              ) : (
                leadingIcon
              )}
            </span>
          )}
          <div className={styles.headerText}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          <IconButton
            icon="X"
            ariaLabel="Close"
            size="s"
            onClick={onClose}
            className={styles.closeBtn}
          />
        </header>

        <div className={styles.body}>{children}</div>

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
