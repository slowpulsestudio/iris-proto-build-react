# Label

A label element for form fields. Displays a text label with optional supporting elements.

## Behaviour

- The label text is provided as projected content — the consumer places plain text (or inline markup) between the opening and closing `<iris-label>` tags. There is no `label` input property.
- Appends a required marker automatically when the associated form control has a required validator. The consumer does not add the required marker manually — it is determined by the parent form field and applied to the label automatically. The marker text defaults to `(Required)` but can be overridden via the `requiredText` input for localisation.
- Optionally shows an info icon after the required marker. The icon appears automatically when `infoText` is provided. Hovering the icon shows `infoText` in a tooltip.
- Optionally shows a character count at the far right of the label row. When used inside `iris-form-field`, the counter is wired automatically — it appears whenever the connected input has a `maxLength` validator, and the count updates as the user types. No consumer configuration is needed. When used standalone, the consumer provides `countValue` and `countMax` inputs directly.
- The required marker and info icon appear left-to-right immediately after the label text; the character count is pushed to the far right regardless of how many other elements are present.
- The label row never wraps. If the label text is too long for the available width it is truncated with an ellipsis. The required marker, info icon, and character count are never truncated.

## Usage

Placed by consumers inside an `iris-form-field` wrapper, directly above the input. The parent form field manages required state and character count automatically — the consumer only needs to provide label text as content and, when needed, `infoText` or `requiredText`.

## Constraints

- There is only one visual type/style — no size variants.
