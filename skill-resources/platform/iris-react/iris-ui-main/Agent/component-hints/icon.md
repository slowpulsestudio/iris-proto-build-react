# Icon — Functional Requirements and Hints

Icons are rendered as inline SVGs that inherit the current text colour and scale to one of three supported pixel sizes: 16px, 20px, or 24px.

Stroke weight follows the size: 16px icons use a 1.5px stroke, while 20px and 24px icons use a 1px stroke.

## Accessibility

Every `iris-icon` must be classified as either meaningful or decorative.

A **decorative** icon (used alongside visible text that already conveys the meaning) must set `[decorative]="true"`. This hides the icon from assistive technology entirely via `aria-hidden`.

A **meaningful** icon (used alone, without accompanying visible text) must provide a `label` string describing its purpose. This is exposed as `role="img"` with `aria-label`. If no `label` is provided, the icon name is used as a fallback — but an explicit label is preferred for clarity.

## Interaction

`iris-icon` has no outputs, no keyboard handling, and no built-in focus behaviour.
