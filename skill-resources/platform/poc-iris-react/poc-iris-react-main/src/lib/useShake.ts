import { useCallback, useRef } from 'react';

/**
 * useShake — p12 "error state shake" (transitions.dev) as an imperative hook.
 *
 * Returns a `ref` to attach to the element that owns the visible border (an
 * input, its wrapper, or a whole form) and a `shake()` function to play the
 * percussive left/right shake on demand — e.g. on a failed validation.
 *
 * Tuning matches the skill defaults: 6px swing, 4px overshoot, legs of
 * 80/80/60/60ms (280ms total) with a per-segment ease. Honors
 * `prefers-reduced-motion` and no-ops where the Web Animations API is absent.
 */
const SHAKE_EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';

export function useShake<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);

  const shake = useCallback(() => {
    const el = ref.current;
    if (!el || typeof el.animate !== 'function') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    el.animate(
      [
        { transform: 'translateX(0)', easing: SHAKE_EASE },
        { transform: 'translateX(6px)', offset: 0.2857, easing: SHAKE_EASE },
        { transform: 'translateX(-6px)', offset: 0.5714, easing: SHAKE_EASE },
        { transform: 'translateX(4px)', offset: 0.7857, easing: SHAKE_EASE },
        { transform: 'translateX(0)', offset: 1 },
      ],
      { duration: 280 },
    );
  }, []);

  return [ref, shake] as const;
}
