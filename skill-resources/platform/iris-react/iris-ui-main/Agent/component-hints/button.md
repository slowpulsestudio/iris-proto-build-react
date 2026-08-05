# Button — Functional Requirements and Hints

## Label text is slotted content

The visible button text is provided by the consumer as slotted content, not as a component property. This keeps the button composable — consumers can project plain text, formatted spans, or other inline elements as the label.

## Size override by a parent group

The `size` property must be two-way bindable. This allows `iris-button-group` to externally override the size of child buttons. Consumers using the button standalone are unaffected.

## Icon-only accessible name

When `buttonType="icon-only"`, the button has no visible text. The slotted label text must still be provided — it is visually hidden using the `iris-screen-reader-only` utility class so that screen readers can announce the button's purpose. Consumers must always slot a meaningful text description even for icon-only buttons.
