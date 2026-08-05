# Link — Functional Requirements and Hints

## Display text falls back to the URL

If no label is provided, the link displays its URL as the visible text. When a label is provided, it takes precedence over the URL.

## Four navigation targets

The link supports four target values: `'_self'` (default), `'_blank'`, `'_parent'`, and `'_top'`. The default opens the destination in the same browsing context.

## Disabled state

A disabled link cannot be activated. It does not navigate, does not respond to pointer interaction, and is removed from the tab order. Disabled links are still rendered in the document so their position in the layout is preserved.

## Visited state

Once the destination URL has been visited by the user, the link changes appearance to indicate it has already been followed. This is driven by browser history and requires no explicit input.
