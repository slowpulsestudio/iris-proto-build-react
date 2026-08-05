# Pagination — Functional Requirements and Hints

## Ellipsis collapses distant pages

When the total number of pages exceeds the maximum number of visible pages, page numbers far from the current page are collapsed into a single ellipsis separator. The first and last pages are always shown. The maximum number of visible middle pages is configurable.

## Navigation buttons disable at the boundaries

The Previous button is disabled when the user is on the first page. The Next button is disabled when the user is on the last page. Disabled navigation buttons are still rendered but cannot be activated.

## Emits a change event

When the user activates a page button or a navigation button, the component emits a change event containing the new page number, the previous page number, and the total number of pages — all as 1-based integers. It does not update the current page internally — the consumer is responsible for reflecting the change back via the current page input.

## Clicking the active page does nothing

Activating the button for the page that is already current produces no output.

## Previous and Next buttons in simplified type

In the simplified layout, the Previous and Next buttons are sized to their content and separated by a comfortable gap.
