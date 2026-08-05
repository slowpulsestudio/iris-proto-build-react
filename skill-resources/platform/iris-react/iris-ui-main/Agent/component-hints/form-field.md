# FormField — Functional Requirements and Hints

A composition wrapper that groups a label, an input control, and optional subtext into a single, cohesive field unit.

## What it does

Provides a consistent vertical layout for a form field. It accepts three projected pieces: an `iris-label` component placed above the input, the input control itself, and one or more optional `iris-subtext` elements placed below the input.

Observes the reactive form state of the input control nested inside it. When the control becomes invalid and touched, the form field shows the first error subtext in DOM order and hides all hint subtexts. When the control is valid or untouched, the form field shows the first hint subtext and hides all error subtexts.

The form field also detects whether the connected input has a required validator and signals this to the label, which then shows the Required indicator automatically — no manual configuration is needed.

The form field wires up ARIA relationships automatically: the label's text receives a stable `id`, and the input control receives a matching `aria-labelledby` pointing to it. When a subtext is visible, the input also receives `aria-describedby` pointing to that subtext. Consumers do not need to manage these IDs manually.

The form field does not render any visible chrome of its own — it is purely a structural and state-coordination wrapper.

## What it does not do

Does not apply visual styling to the label or input. Does not enforce which input component is used inside it. Does not know about specific validator rules — it only knows whether the control is in an error state. Does not produce or format error messages — all message text is supplied by the consumer.
