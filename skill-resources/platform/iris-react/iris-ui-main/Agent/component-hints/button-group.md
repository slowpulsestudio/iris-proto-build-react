# Button Group — Functional Requirements and Hints

## Valid children

Only `iris-button` elements are valid children. Content projection must be restricted so that only `iris-button` elements are rendered inside the group; any other projected content is silently ignored.

## Accessibility

The group must be marked with `role="group"` for accessibility.

## Size propagation

When a `size` is set on the button group, it must be automatically applied to all child buttons. Individual button size inputs are ignored while the button is inside a group. The size propagation must not require any changes to the button component — it must be implemented entirely within the button-group component.

## Stories

Stories must demonstrate a button group containing one primary button, one secondary button, and one ghost button together.
