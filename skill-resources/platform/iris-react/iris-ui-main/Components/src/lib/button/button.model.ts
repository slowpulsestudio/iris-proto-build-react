// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
/** Visual style of the button (maps to the `variant` input). */
export type ButtonStyle = 'primary' | 'secondary' | 'ghost' | 'danger';
/** Content layout: `'text-only'` shows label only; `'icon-text'` adds a leading icon; `'icon-only'` shows icon with a screen-reader label. */
export type ButtonType = 'text-only' | 'icon-text' | 'icon-only';
/** Visual size of the button. */
export type ButtonSize = 'sm' | 'default' | 'lg';
/** Internal visual state used in Figma token mapping and story controls. Not a component input. */
export type ButtonState = 'default' | 'hover' | 'focused' | 'disabled';
