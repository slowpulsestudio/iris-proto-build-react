# Radio Buttons — Functional Requirements and Hints

## Two-element composition

The radio button feature is split into two separate, cooperating elements: a group element and an individual button element. The group element wraps one or more button elements as direct children. The group owns the selected value and the disabled state for the whole set. Each button element owns its own label, optional supporting text, and its own optional disabled flag. A button element must always be placed inside a group element — it has no standalone behaviour.

## Label interaction

The entire component area is clickable and triggers a selection — not just the radio button itself.

## Layout

The radio button and label occupy the same row. Supporting text, when present, appears below the label — not below the radio button. The radio button remains vertically centred against the label regardless of whether supporting text is present.

## Form binding

The radio button group can be bound to a form as a form control, allowing the selected value to be tracked, validated, and programmatically set or cleared.
