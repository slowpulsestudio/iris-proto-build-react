# Checkbox — Functional Requirements and Hints

## Toggle behaviour

A checkbox represents a binary on/off choice the user can toggle. Clicking a checked checkbox sets it to unchecked; clicking an unchecked checkbox sets it to checked.

## Indeterminate state

The checkbox supports an indeterminate state to represent a partially-selected group. `checked` and `indeterminate` are independent flags. `indeterminate` takes visual precedence over `checked`. Clicking an indeterminate checkbox clears the indeterminate state and sets the checkbox to unchecked.

## Label interaction

The entire component area is clickable and triggers a toggle — not just the box itself.

## Layout

Use CSS grid for the component layout. The checkbox box and label share the first row; supporting text occupies the second row in the label column. This ensures the box is always vertically centred against the label regardless of whether supporting text is present.

## Angular Reactive forms compatibility

The checkbox component is compatible with ReactiveFormsModule. It supports `[formControl]` for standalone controls and `formControlName` for controls within a `FormGroup`.
