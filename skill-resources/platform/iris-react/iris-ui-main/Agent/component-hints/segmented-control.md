# Segmented Control — Functional Requirements and Hints

## Mutual exclusivity

A segmented control presents a fixed set of options where exactly one option is active at a time. Selecting a new option deactivates the previously active one.

## Display type

The component has three display modes that apply to all segments uniformly:

- **icon-text**: shows both the icon and the text label inside each segment. When no icon is available for an item, only the label is shown.
- **icon-only**: shows only the icon inside the segment. The label is hidden visually and shown as a tooltip on hover or focus. It also serves as the accessible label for screen readers. When an item has no icon, the label is shown as a fallback. This is the default.
- **text-only**: always shows the text label regardless of whether an icon is available.

## Item count

A segmented control works best with three to five options. Each item must have a unique value.

## Reactive forms integration

The component works as a `ControlValueAccessor`. It can be bound to an Angular reactive `FormControl` using `formControl` or `formControlName` directives. The selected value is read from and written to the form control automatically. When the form control is disabled, all segments become non-interactive.
