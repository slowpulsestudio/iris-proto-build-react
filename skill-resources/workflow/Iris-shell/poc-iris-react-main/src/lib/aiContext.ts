/**
 * Shared type for "context attachments" that any page can pass to the AI
 * panel. Today only `user` rows attach context; the discriminator allows
 * adding `group`, `device`, etc. without breaking the API.
 *
 * The panel reads this from {@link useAppShell} and renders chips above the
 * composer until the user sends a message — at which point the items are
 * captured into the outgoing user message as inline attachments and the
 * pending context is cleared.
 */
export interface AiContextItem {
  /** Discriminator for future entity types. */
  kind: 'user' | 'group' | 'device';
  /** Stable id of the underlying entity (e.g. `User.id`). */
  id: string;
  /** Human-readable label shown inside the chip. */
  label: string;
}
