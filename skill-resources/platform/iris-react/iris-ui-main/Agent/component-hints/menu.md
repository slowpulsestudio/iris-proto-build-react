# Menu — Functional Requirements and Hints

## Directive trigger

The menu is opened by attaching a directive to any host element. The host element acts as the trigger: clicking it opens the menu panel in a floating overlay positioned relative to the trigger. Clicking the trigger again closes the menu.

## Overlay positioning

The default preferred position is bottom-start (the menu appears below and left-aligned with the trigger). When the preferred position does not fit within the viewport, the overlay automatically tries fallback positions in order: bottom-start → bottom-end → top-start → top-end. The preferred position is configurable by the consumer.

## Close behaviour

The menu closes when the user selects an item, clicks anywhere outside the menu, presses Escape, or presses Tab. The menu also closes when the host element is destroyed.

## Item selection

Clicking or pressing Enter/Space on a non-disabled, non-separator item emits a selection event from the directive with the selected item as the payload. After emission, the menu closes.

## Destructive items

Individual items can be marked as destructive. Destructive items are rendered in a danger colour to communicate that the action is irreversible or has significant consequences. Destructive items are still interactive and selectable unless also disabled.

## Separators

Items with type `'separator'` render as a visual divider. They never receive click events, focus, or emit selection events.

## Disabled items

Disabled items are not focusable and do not emit a selection event on click or keyboard activation.

## Nested items

An item can declare children for a `MenuItem` containing further `MenuItem` entries. When the user hovers a parent item, a sub-menu panel opens to the side: right-start by default, falling back to left-start when the viewport has insufficient room. Pressing ArrowRight, Enter, or Space on a focused parent item also opens its sub-menu and moves focus to its first item. Pressing ArrowLeft while focus is inside a sub-menu closes that sub-menu and returns focus to the parent item. The parent item displays a caret-right indicator. Selecting any leaf item in the hierarchy emits the selection event and collapses the entire menu. Sub-menus can be nested arbitrarily deep.

## Width

The menu grows to fit its content within a minimum and maximum width. Labels that exceed the available width are clipped with an ellipsis.

## Open animation

When the menu panel appears, it plays a brief entrance animation. This gives users a clear visual cue that the overlay has opened.

## Accessibility

The trigger element carries `aria-haspopup="menu"` at all times. When the menu is open, the trigger also carries `aria-expanded="true"` and `aria-controls` referencing the menu panel element. When the menu is closed, `aria-expanded` is `false` and `aria-controls` is removed. The menu panel uses `role="menu"` and each interactive item uses `role="menuitem"`. Disabled items are excluded from keyboard navigation and marked with `aria-disabled`. Items with children carry `aria-haspopup="menu"`.

Keyboard navigation:
- **ArrowDown / ArrowUp** — move focus to the next / previous focusable item.
- **Home / End** — move focus to the first / last focusable item.
- **Enter / Space** — activate the focused item. On an item with children, opens the sub-menu and moves focus to its first item.
- **ArrowRight** — on an item with children, opens the sub-menu and moves focus to its first item.
- **ArrowLeft** — closes the current sub-menu and returns focus to the parent item.
- **Escape** — closes the menu and returns focus to the trigger.
- **Tab** — closes the menu.
