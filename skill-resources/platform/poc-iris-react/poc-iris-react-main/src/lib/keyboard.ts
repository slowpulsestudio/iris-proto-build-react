/**
 * Shared helpers for global keyboard shortcuts.
 *
 * Global shortcut handlers register on `window`, so they fire regardless of
 * where focus is. Use {@link isTypingTarget} to bail out when the user is
 * typing into a text-entry surface (or an editor where the keystroke has its
 * own meaning, e.g. ⌘B = bold) so shortcuts don't hijack the input.
 */

/**
 * True when the event target is a text-entry surface: an `<input>`,
 * `<textarea>`, `<select>`, or any `contenteditable` element.
 */
export function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT')
  );
}
