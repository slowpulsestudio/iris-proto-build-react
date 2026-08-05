# TextArea — Functional Requirements and Hints

A multi-line text input field composed with an external label and optional feedback text.

## What it does

The textarea is designed for composition: it is placed inside an `iris-form-field` wrapper together with an `iris-label` (which provides the visible label and, when relevant, a character counter and required indicator) and `iris-subtext` elements for hint and validation error messages. The textarea itself does not render a label or feedback — those are the responsibility of sibling elements managed by the form field.

Displays a textarea that the user can type into across multiple lines. The textarea can be disabled (preventing all interaction), or set to readonly (showing the value without allowing edits). The textarea is vertically resizable by the user.

## How the character counter works

When a `maxLength` validator is present on the associated form control, the label's character counter appears automatically via the form-field token. The current count and maximum are derived from the control — no manual binding is required.

## How the required indicator works

When the form control has a `required` validator, the label's required indicator appears automatically via the form-field token.

## How validation errors work

When the form control is invalid and has been touched, `iris-form-field` shows the first `iris-subtext type="error"` and hides any hint subtext. The textarea itself receives an error border automatically. Consumers declare individual error messages with `@if` conditions on the control's error keys.

## What it does not do

Does not support single-line input. Does not render its own label or feedback text — those must be provided externally using `iris-label` and `iris-subtext` inside `iris-form-field`.
