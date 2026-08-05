// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
/** Internal visual state of the tag. Not a component input; driven by interaction events. */
export type TagState = 'default' | 'hover' | 'focus-action' | 'focus-content';

/** Configuration object used by components that render a tag inline. */
export interface TagConfig {
  /** Visible text content of the tag. */
  text: string;
  /** Whether the tag renders a remove (×) button. */
  removable: boolean;
}
