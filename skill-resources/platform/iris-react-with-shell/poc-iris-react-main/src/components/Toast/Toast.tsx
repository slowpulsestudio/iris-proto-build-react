import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../Icon/Icon.js';
import { IconButton } from '../IconButton/IconButton.js';
import styles from './Toast.module.css';

export interface ToastProps {
  /** Truthy = visible. Setting a new message resets the auto-dismiss timer. */
  message: string | null;
  /** Called when the auto-dismiss timer fires or the user clicks the dismiss
   *  button. Owner clears its own `message` state in response. */
  onDismiss: () => void;
  /** Auto-dismiss delay in ms. */
  durationMs?: number;
}

/**
 * Toast — bottom-right status notification matching the Figma `Toast`
 * component (white card, featured success icon, dismiss X).
 *
 * Controlled: the parent owns the message string and clears it when
 * `onDismiss` fires. A new non-null `message` resets the timer, so a
 * second toast within `durationMs` replaces the first.
 *
 * Rendered through a portal at `document.body` so it floats above the
 * AI panel, modals, and side sheets without inheriting their stacking
 * context.
 */
export function Toast({ message, onDismiss, durationMs = 3000 }: ToastProps) {
  // Two-stage state so the leave transition has time to play after the
  // owner clears `message`. `shown` holds the last non-null text and is
  // cleared on a short delay after the prop goes null.
  const [shown, setShown] = useState<string | null>(null);
  // Drives `data-visible`. Held false on the first committed frame so the
  // rise-from-below enter transition actually plays (a node mounted directly
  // in its final state animates nothing) — flipped true on the next frame.
  const [visible, setVisible] = useState(false);

  // Stash `onDismiss` in a ref so the auto-dismiss effect doesn't depend
  // on it. Owners commonly pass an inline arrow (e.g. `() => setX(null)`)
  // which is a fresh reference each render — if it were in the deps, every
  // parent re-render would re-arm the timer, and the toast could outlive
  // its `durationMs` indefinitely (e.g. while a stream ticker keeps
  // re-rendering the parent at ~30ms intervals).
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!message) return;
    setShown(message);
    // Flip to visible on the next frame so the enter transition runs from
    // the resting (below + faded + blurred) state.
    const raf = requestAnimationFrame(() => setVisible(true));
    const id = setTimeout(() => onDismissRef.current(), durationMs);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(id);
    };
  }, [message, durationMs]);

  // Hide local copy once the owner clears the prop, after a short delay
  // so the CSS opacity/transform transition can play out.
  useEffect(() => {
    if (message === null) {
      setVisible(false);
      const id = setTimeout(() => setShown(null), 200);
      return () => clearTimeout(id);
    }
  }, [message]);

  if (!shown) return null;

  return createPortal(
    <div
      className={styles.toast}
      role="status"
      aria-live="polite"
      data-visible={visible ? 'true' : 'false'}
    >
      <span className={styles.icon} aria-hidden="true">
        <Icon name="Check" size="20px" />
      </span>
      <p className={styles.message}>{shown}</p>
      <IconButton
        icon="X"
        ariaLabel="Dismiss notification"
        size="s"
        className={styles.dismiss}
        onClick={onDismiss}
      />
    </div>,
    document.body,
  );
}
