# Key flows

## Switching verticals

Clicking a product in the header calls `navigate('#/…')`; the `hashchange` sets the route, `App` renders the matching page, and `useVertical()` re-derives the chrome. Product chooser, global sidebar, AI panel title, and (optional) secondary sidebar all come from one `Vertical` record in [verticals.ts](../src/lib/verticals.ts). Adding a vertical is one record + one route — see [A1](architecture.md#a1--vertical-model-is-the-extension-point).

## Attaching selection to AI

The only cross-page channel. A page calls `setAiContext([...])` + `setAiOpen(true)`; the panel renders chips and context-aware prompts, then `clearAiContext()` on send.

## Editing a user

`EditPropertiesSheet` holds local form state and calls `UsersContext.updateUser` on save — the single mutation point. It re-derives `name` from `firstName + lastName`, so list and detail stay in sync.

## Resetting a password

Three-state modal: confirm → readonly generated password → "Copied" pill (2s). The password is generated client-side via `crypto.getRandomValues`. See [ResetPasswordModal.tsx](../src/views/UserDetailPage/ResetPasswordModal/ResetPasswordModal.tsx).

## Browsing AI chat history

Conversations persist per vertical in `localStorage` ([chatHistoryStore.ts](../src/lib/chatHistoryStore.ts)): capped at 50, schema-versioned, sorted newest-first. Storage failures (private mode, quota, parse errors) degrade silently. The history view filters by search and groups rows by date bucket (Today / Yesterday / Previous 7 days / Older) using DST-safe calendar-day boundaries.
