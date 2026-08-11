import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
  type MutableRefObject,
  type PointerEvent,
  type ReactElement,
  type Ref,
} from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../lib/cx.js';
import styles from './Tooltip.module.css';

export type TooltipPlacement = 'top' | 'bottom';

export interface TooltipProps {
  /** Visible tooltip text. */
  label: string;
  /**
   * Optional keyboard shortcut chips shown on the right of the label,
   * e.g. `['⌘', 'S']`. Matches the Figma `.Tooltip` shortcut variant.
   */
  shortcut?: string[];
  /** Position relative to the trigger. */
  placement?: TooltipPlacement;
  /** Hover delay before showing, in ms. Focus always shows instantly. */
  delay?: number;
  /** Anchor the tooltip to the current mouse position while hovering. */
  followCursor?: boolean;
  /**
   * The trigger element. Must be a single React element that forwards a
   * ref and spreads unknown props (native elements and any of our existing
   * `forwardRef` components qualify).
   */
  children: ReactElement;
  className?: string;
}

const SHOW_DELAY_DEFAULT = 400;
const TOOLTIP_OFFSET = 6;
const VIEWPORT_MARGIN = 4;

/**
 * Tooltip — accessible, portal-rendered hover/focus tip.
 *
 *   <Tooltip label="Copy reply">
 *     <IconButton icon="Copy" ariaLabel="Copy reply" onClick={...} />
 *   </Tooltip>
 *
 * Behaviour:
 *  - Shows on hover after `delay` (default 400ms) and on focus instantly.
 *  - Hides on mouse-leave, blur, or Escape.
 *  - Portal-rendered into `document.body` so it isn't clipped by ancestor
 *    `overflow: hidden` containers (e.g. the scrollable AI panel body).
 *  - `aria-describedby` is injected onto the trigger so screen readers
 *    announce the tooltip text when the trigger gains focus.
 *  - Vertical placement auto-flips to the opposite side if the requested
 *    side has no room; horizontal position is centred on the trigger and
 *    clamped to the viewport. Both axes fall back to a clamp if neither
 *    side fits (e.g. tooltip larger than the viewport).
 *  - Respects `prefers-reduced-motion` (CSS).
 */
export function Tooltip({
  label,
  shortcut,
  placement = 'top',
  delay = SHOW_DELAY_DEFAULT,
  followCursor = false,
  children,
  className,
}: TooltipProps) {
  const id = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Set true when the trigger is pressed so the click-induced focus that
  // follows doesn't instantly re-open the tooltip over the just-clicked
  // control (which reads as a flicker/conflict on click). Reset on leave/blur.
  const clickDismissedRef = useRef(false);
  const pointerPosRef = useRef<{ x: number; y: number } | null>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const clearShowTimer = () => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
  };

  const show = useCallback(
    (immediate: boolean) => {
      clearShowTimer();
      if (immediate || delay <= 0) {
        setOpen(true);
        return;
      }
      showTimerRef.current = setTimeout(() => {
        showTimerRef.current = null;
        setOpen(true);
      }, delay);
    },
    [delay],
  );

  const hide = useCallback(() => {
    clearShowTimer();
    setOpen(false);
    // Drop the stale position so the next show measures fresh before paint
    // (the layout effect runs synchronously and replaces this before paint
    // anyway, but clearing avoids a one-frame ghost at the old coords if
    // the trigger has moved a long distance between hides).
    setPos(null);
  }, []);

  useEffect(() => () => clearShowTimer(), []);

  // Place + reposition on scroll/resize while open. Uses `useLayoutEffect`
  // so the first paint after `open` flips true already has correct coords.
  useLayoutEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const tip = tooltipRef.current;
    if (!trigger || !tip) return;
    const computePos = () => {
      const tipRect = tip.getBoundingClientRect();
      const vh = window.innerHeight;
      const vw = window.innerWidth;

      if (followCursor && pointerPosRef.current) {
        const { x, y } = pointerPosRef.current;
        let top =
          placement === 'top'
            ? y - tipRect.height - TOOLTIP_OFFSET
            : y + TOOLTIP_OFFSET;
        top = Math.max(VIEWPORT_MARGIN, Math.min(vh - tipRect.height - VIEWPORT_MARGIN, top));

        let left = x + TOOLTIP_OFFSET;
        if (left + tipRect.width > vw - VIEWPORT_MARGIN) {
          left = x - tipRect.width - TOOLTIP_OFFSET;
        }
        left = Math.max(VIEWPORT_MARGIN, Math.min(vw - tipRect.width - VIEWPORT_MARGIN, left));

        setPos({ top, left });
        return;
      }

      const tr = trigger.getBoundingClientRect();

      // Vertical: prefer the requested placement, but flip to the opposite
      // side if the preferred side doesn't fit and the opposite one does.
      // Keeps the tooltip on-screen without overlapping the trigger.
      const topIfAbove = tr.top - tipRect.height - TOOLTIP_OFFSET;
      const topIfBelow = tr.bottom + TOOLTIP_OFFSET;
      const fitsAbove = topIfAbove >= VIEWPORT_MARGIN;
      const fitsBelow = topIfBelow + tipRect.height <= vh - VIEWPORT_MARGIN;
      const useAbove =
        placement === 'top' ? fitsAbove || !fitsBelow : !fitsBelow && fitsAbove;
      let top = useAbove ? topIfAbove : topIfBelow;
      // Final safety net for the pathological case where neither side fits
      // (e.g. trigger is taller than the viewport, or pressed to an edge).
      top = Math.max(VIEWPORT_MARGIN, Math.min(vh - tipRect.height - VIEWPORT_MARGIN, top));

      // Horizontal: center on the trigger, clamp to the viewport.
      let left = tr.left + tr.width / 2 - tipRect.width / 2;
      left = Math.max(VIEWPORT_MARGIN, Math.min(vw - tipRect.width - VIEWPORT_MARGIN, left));

      setPos({ top, left });
    };
    computePos();
    // `capture: true` so we catch scrolls in any ancestor, not just window.
    const scrollOpts: AddEventListenerOptions = { capture: true, passive: true };
    window.addEventListener('scroll', computePos, scrollOpts);
    window.addEventListener('resize', computePos);
    // Observe both rects so a label/shortcut change (tooltip width) or a
    // trigger resize re-centres position without enumerating deps. Without
    // this, dynamic labels (e.g. "Copy reply" → "Copied") drift off-centre
    // because the effect only re-runs on [open, placement].
    const ro = new ResizeObserver(computePos);
    ro.observe(tip);
    ro.observe(trigger);
    return () => {
      window.removeEventListener('scroll', computePos, scrollOpts);
      window.removeEventListener('resize', computePos);
      ro.disconnect();
    };
  }, [open, placement, followCursor]);

  // Escape dismisses, mirroring the Menu pattern.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, hide]);

  if (!isValidElement(children)) {
    throw new Error('<Tooltip> requires a single React element as its child.');
  }
  const child = Children.only(children) as ReactElement;
  const childProps = child.props as Record<string, unknown>;
  // React 19 exposes the consumer's ref on the element object so we can
  // compose with it rather than clobber it.
  const childRef =
    (child as ReactElement & { ref?: Ref<HTMLElement> }).ref ?? undefined;

  const composedRef = useCallback(
    (node: HTMLElement | null) => {
      triggerRef.current = node;
      if (typeof childRef === 'function') {
        childRef(node);
      } else if (childRef && typeof childRef === 'object' && 'current' in childRef) {
        (childRef as MutableRefObject<HTMLElement | null>).current = node;
      }
    },
    [childRef],
  );

  const trigger = cloneElement(child, {
    ref: composedRef,
    // Append our id rather than replace, so any existing description
    // (e.g. a form error message) is preserved. The reference is set
    // *unconditionally* — not gated on `open` — because on keyboard focus
    // the browser fires focus → AT announces description → React re-renders
    // (in that order). If we only added the id when `open` flipped true,
    // most screen readers would miss the description on the first focus.
    // When the tooltip element isn't mounted, AT silently no-ops on the
    // dangling reference (per ARIA spec / NVDA/JAWS/VoiceOver behaviour).
    'aria-describedby': cx(
      childProps['aria-describedby'] as string | undefined,
      id,
    ),
    onMouseEnter: (e: MouseEvent<HTMLElement>) => {
      (childProps.onMouseEnter as ((e: MouseEvent<HTMLElement>) => void) | undefined)?.(e);
      pointerPosRef.current = { x: e.clientX, y: e.clientY };
      if (!clickDismissedRef.current) show(false);
    },
    onMouseMove: (e: MouseEvent<HTMLElement>) => {
      (childProps.onMouseMove as ((e: MouseEvent<HTMLElement>) => void) | undefined)?.(e);
      if (!followCursor) return;
      pointerPosRef.current = { x: e.clientX, y: e.clientY };
      if (!open || !tooltipRef.current) return;

      const tipRect = tooltipRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      let top =
        placement === 'top'
          ? e.clientY - tipRect.height - TOOLTIP_OFFSET
          : e.clientY + TOOLTIP_OFFSET;
      top = Math.max(VIEWPORT_MARGIN, Math.min(vh - tipRect.height - VIEWPORT_MARGIN, top));

      let left = e.clientX + TOOLTIP_OFFSET;
      if (left + tipRect.width > vw - VIEWPORT_MARGIN) {
        left = e.clientX - tipRect.width - TOOLTIP_OFFSET;
      }
      left = Math.max(VIEWPORT_MARGIN, Math.min(vw - tipRect.width - VIEWPORT_MARGIN, left));
      setPos({ top, left });
    },
    onMouseLeave: (e: MouseEvent<HTMLElement>) => {
      (childProps.onMouseLeave as ((e: MouseEvent<HTMLElement>) => void) | undefined)?.(e);
      clickDismissedRef.current = false;
      pointerPosRef.current = null;
      hide();
    },
    onFocus: (e: FocusEvent<HTMLElement>) => {
      (childProps.onFocus as ((e: FocusEvent<HTMLElement>) => void) | undefined)?.(e);
      if (!clickDismissedRef.current) show(true);
    },
    onBlur: (e: FocusEvent<HTMLElement>) => {
      (childProps.onBlur as ((e: FocusEvent<HTMLElement>) => void) | undefined)?.(e);
      clickDismissedRef.current = false;
      hide();
    },
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      (childProps.onPointerDown as ((e: PointerEvent<HTMLElement>) => void) | undefined)?.(e);
      // Pressing the trigger hides the tip and blocks the follow-up focus
      // from re-showing it until the pointer leaves and returns.
      clickDismissedRef.current = true;
      hide();
    },
    // `cloneElement`'s props are typed as `Partial<P> & Attributes`. With
    // P=unknown the `ref` key isn't accepted statically, so cast through
    // `Record<string, unknown>` to inject ref + handlers without losing
    // runtime correctness.
  } as Record<string, unknown>);

  return (
    <>
      {trigger}
      {open &&
        createPortal(
          <div
            ref={tooltipRef}
            id={id}
            role="tooltip"
            className={cx(styles.tooltip, className)}
            // Hide the first frame until layout measures real coords.
            style={
              pos
                ? { top: pos.top, left: pos.left }
                : { top: 0, left: 0, visibility: 'hidden' }
            }
          >
            <span className={styles.label}>{label}</span>
            {shortcut && shortcut.length > 0 && (
              <span className={styles.shortcut} aria-hidden="true">
                {shortcut.map((k, i) => (
                  <span key={i} className={styles.key}>
                    {k}
                  </span>
                ))}
              </span>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
