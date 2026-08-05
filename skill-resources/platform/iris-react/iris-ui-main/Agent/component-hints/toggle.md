# Toggle — Functional Requirements and Hints

## Toggle behaviour

A toggle represents a binary on/off choice. Clicking the toggle switches it from off to on, or from on to off. The value is a boolean: `true` means on, `false` means off.

## Disabled state

When disabled, the toggle does not respond to any interaction. It remains visually in its current on/off state but appears visually muted to signal that it cannot be changed.

## Accessible name

The toggle renders as a `role="switch"` button. It has no visible label of its own. The accessible name must be provided by the consumer as slotted text content. This text is visually hidden using the `iris-screen-reader-only` utility class so screen readers can announce the toggle's purpose. Consumers must always slot a meaningful description.

## Angular Reactive Forms compatibility

The toggle is compatible with ReactiveFormsModule. It supports `[formControl]` for standalone controls and `formControlName` for controls within a `FormGroup`. It also supports `[(ngModel)]` binding.
