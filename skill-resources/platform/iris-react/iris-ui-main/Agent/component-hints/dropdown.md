# Dropdown

The dropdown is a single-select form input that lets the user choose one value from a panel of options.

## Options
Options have a label and a value. An option can be disabled, in which case it appears in the list but cannot be selected. An option can carry an optional leading icon displayed to the left of its label.

## Display
The dropdown has two sizes. A leading icon can appear inside the trigger to provide context.

## Open / close
- The panel opens when the user clicks the trigger, or presses Enter, Space, or Arrow Down while the trigger is focused.
- The panel closes when the user selects an option, presses Escape, or when focus leaves the component for any reason (Tab key, click outside). This single focus-loss mechanism covers all "close on blur" scenarios.
- When the panel closes because the user selected an option or pressed Escape, focus returns to the trigger.
- When the panel closes because focus moved elsewhere (Tab, outside click), focus is not redirected.

## Keyboard navigation
- **Enter / Space** — toggle open / close.
- **Escape** — close; return focus to trigger.
- **Arrow Down / Arrow Up** — move focus to next / previous enabled option.
- **Home** — move focus to the first enabled option.
- **End** — move focus to the last enabled option.
- **Printable character** — when the panel is open, jump focus to the first enabled option whose label begins with that character (typeahead).
- **Tab** — close the panel and move focus to the next focusable element (handled via focus-loss, not intercepted).

## States
- **Default** — no value selected; placeholder text is shown.
- **Selected** — a value is chosen; the option label is shown.
- **Error** — trigger shows a red border; error state comes from the bound Angular form control (invalid + touched).
- **Disabled** — trigger and options are not interactive.

## Form integration
The dropdown works with Angular reactive forms and template-driven forms (`[(ngModel)]`). It reflects form-control state (invalid, touched, disabled) and respects the required validator.

## Accessibility
- The trigger has `role="combobox"` with `aria-expanded`, `aria-haspopup="listbox"`, and when the panel is open, `aria-controls` referencing the listbox element.
- `aria-required` is set on the trigger when the bound form control has `Validators.required`.
- `aria-invalid` is set on the trigger when the control is invalid and touched.
- `aria-disabled` is set on the trigger when the dropdown is disabled.
- Disabled options carry `aria-disabled` and are excluded from keyboard navigation.
