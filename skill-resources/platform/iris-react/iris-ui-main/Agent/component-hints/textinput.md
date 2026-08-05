# TextInput — Functional Requirements and Hints

A single-line text field intended to be used inside an `iris-form-field` composition.

## What it does

Displays a text field that the user can type into. It is designed to be composed with `iris-label` (placed above it) and `iris-subtext` (placed below it) inside an `iris-form-field` wrapper. The label, hint text, and error messages are provided by those sibling components — not by the text input itself.

The input registers its reactive form state with the parent `iris-form-field` so that error display and the required indicator on the label can be coordinated automatically across the label, input, and subtext.

A live character counter is shown on the label when the associated form control has a `maxLength` validator. The count is wired automatically through `iris-form-field` — no consumer configuration is needed. The `countValue` and `countMax` inputs on `iris-label` remain available as a fallback for standalone use outside of `iris-form-field`.

The input can be disabled (preventing all interaction) or set to readonly (showing the value without allowing edits).

Leading and trailing icons can be placed inside the input field to indicate the nature of the input or trigger an action.

A larger size variant is available for contexts that require a more prominent input, such as inline search or hero forms.

## What it does not do

Does not render its own label or feedback text. Does not enforce a maximum character length natively — the counter is display-only. Does not support multi-line input.
