# Banner — Functional Requirements and Hints

## Dismiss behaviour

Clicking dismiss sets internal visibility to false and emits the dismissed event. The banner is removed from the DOM via conditional rendering, not hidden with CSS.

## Dismissable control

When `dismissable` is false, the dismiss button is not rendered and the banner cannot be closed by the user.

## Action buttons

Both primary and secondary action buttons only render when `showActions` is true.

## Supporting text

The supporting text element is only rendered when a non-empty string is provided.

## Accessibility and interaction

The dismiss button uses `aria-label="Dismiss"`.

There are no custom keyboard listeners in the component. Keyboard support comes from the buttons only.
