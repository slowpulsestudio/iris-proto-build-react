# Toast — Functional Requirements and Hints

## Purpose

A toast is a brief, non-blocking notification that appears at the bottom-right of the viewport to communicate status feedback. It does not interrupt the user's current task. Use toasts for confirmations, warnings, errors, or informational messages that do not require a user decision.

## Programmatic-only API

Toasts are displayed exclusively through `IrisToastService`. They are never declared in templates. The consumer calls `service.show(config)` and receives an `IrisToastRef` back. The service lazily creates a single container component attached to `document.body` and reuses it for all subsequent toasts.

## IrisToastRef

`IrisToastRef` exposes:

- `dismiss()` — removes the toast immediately, triggering the exit animation.
- `afterDismissed()` — `Observable<IrisToastDismissReason>` that emits once when the toast is fully removed, then completes. The emitted value is one of:
  - `'dismissed'` — × button clicked, auto-dismiss fired, or `ref.dismiss()` called programmatically
  - `'primaryAction'` — primary action button was clicked (toast is also dismissed automatically)
  - `'secondaryAction'` — secondary action button was clicked (toast is also dismissed automatically)

Clicking an action dismisses the toast — no need to call `ref.dismiss()` from the subscriber.

## Auto-dismiss

Toasts auto-dismiss after a configurable duration. The default is 5000 ms. Set `duration: null` to disable auto-dismiss and require explicit user or programmatic dismissal. When `primaryActionLabel` or `secondaryActionLabel` is provided, `duration` defaults to `null` — users must have time to interact with action buttons.

Calling `ref.dismiss()` before the timer fires cancels the timer.

## Types

Four semantic types are supported: `info`, `warning`, `error`, `success`. The type determines the icon, color, and live-region role. Defaults to `info`. The icon is always shown.

## Dismiss button

The dismiss (×) button is shown by default. Set `dismissible: false` to hide it. The button carries an accessible label that defaults to `'Dismiss'` and can be overridden for non-English UIs via `dismissAriaLabel`.

## Action buttons

Action buttons are rendered when `primaryActionLabel` or `secondaryActionLabel` is set in the config — there is no separate `showActions` flag. Each button is suppressed when its label is an empty string, preventing unlabeled focusable elements. The two actions are completely independent.

React to clicks and dismissal via `afterDismissed()`, which emits an `IrisToastDismissReason`: `'dismissed'`, `'primaryAction'`, or `'secondaryAction'`. Clicking an action button dismisses the toast automatically — callers do not need to call `ref.dismiss()` from within the subscriber.

## Animations

Toasts animate in on mount (slide up + fade in) and animate out on dismissal (slide right + fade out). The exit animation plays before the DOM element is removed. `afterDismissed()` emits only after the exit animation completes.

## Accessibility

- `role="alert"` (assertive) is applied for `warning` and `error` types; `role="status"` (polite) for `info` and `success`.
- `aria-atomic="true"` is set so assistive technologies read the full toast content as a single announcement.
- The screen-reader type prefix (e.g. "Info: ", "Error: ") is visually hidden but announced before the title. All four prefix strings are localizable via `IrisToastConfig`: `infoAriaLabel`, `warningAriaLabel`, `errorAriaLabel`, `successAriaLabel`.
- Focus is never moved to the toast. Toasts are non-modal and must not disrupt the user's current focus position.
