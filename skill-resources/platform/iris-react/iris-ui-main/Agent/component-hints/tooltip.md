# Tooltip — Functional Requirements and Hints

## Applied as a directive, not a component

A tooltip is attached to an existing element by the consumer, not inserted as a standalone element. The consumer declares what element the tooltip belongs to — the tooltip itself is not part of the normal document flow and is not present in the DOM when hidden.

## Trigger

The tooltip appears when the user hovers over or moves keyboard focus to the trigger element. It disappears when the pointer leaves or focus moves away.

## Positioning

The tooltip can appear on any of the four sides of its trigger. It defaults to appearing above the trigger. If the preferred position would be clipped by the viewport, the tooltip shifts to a position where it fits.

## Optional keyboard shortcut

The tooltip can display one or more keyboard key labels alongside the tooltip text. Each key is rendered as a distinct badge. The order of keys matches the order the consumer supplies them.

## Disabled state

When disabled, the tooltip does not appear on hover or focus. The trigger element is otherwise unaffected.

## Theming

The tooltip always renders with a dark appearance regardless of the active global theme. In standard light and dark themes it uses the dark colour palette. In high-contrast light and high-contrast dark themes it uses the high-contrast dark colour palette. Any components rendered inside the tooltip (such as keyboard key badges) must also adopt this dark or high-contrast dark appearance, even when the surrounding page is in a light theme.

## Accessibility

The trigger element is programmatically associated with the tooltip while it is visible, so assistive technologies can announce the tooltip content. This association is removed when the tooltip hides.
