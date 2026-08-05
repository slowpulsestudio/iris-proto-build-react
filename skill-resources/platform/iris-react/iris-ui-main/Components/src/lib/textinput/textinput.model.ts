// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
/** Internal visual state of the text input. Not a component input; driven by focus and form control state. */
export type TextInputState = 'empty' | 'focus' | 'active' | 'filled' | 'error' | 'disabled' | 'readonly';
/** Visual height preset of the text input. */
export type TextInputSize = 'default' | 'lg';
