# Breadcrumb — Functional Requirements and Hints

## Overflow item

When the breadcrumb path is too long, intermediate items can be replaced with an overflow item rendered as `...`. Clicking the overflow item reveals a dropdown listing the hidden breadcrumb levels, each navigable.

## Non-clickable items

Any item that has no `href` always renders as plain non-interactive text, regardless of its position in the path.

## Current page

The last item always renders as plain text with `aria-current="page"` unless `currentPageClickable` is true. When `currentPageClickable` is true, the last item renders as a link if it has an `href`.

## Separator

The `/` separator is rendered as part of each item except the last. It is never rendered as a standalone list element.
