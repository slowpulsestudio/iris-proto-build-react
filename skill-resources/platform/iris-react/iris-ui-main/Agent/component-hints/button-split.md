# Button Split — Functional Requirements and Hints

## Two-part action control

A button split presents two interactive parts side by side: a primary action button on the left and a chevron (dropdown trigger) on the right. The two parts are visually joined as a single unit but act independently.

## Primary action

Clicking the primary part emits a click event directly from the button split. It does not open the menu.

## Dropdown menu

Clicking the chevron part opens a floating dropdown menu anchored to the component. The menu accepts the same `MenuItem` array used by the standalone menu component. Selecting an item from the dropdown emits a menu item selection event with the selected item as the payload and closes the menu.

## Shared state

The two parts share the same disabled and loading states. When the component is disabled or loading, both the primary button and the chevron are inactive.
