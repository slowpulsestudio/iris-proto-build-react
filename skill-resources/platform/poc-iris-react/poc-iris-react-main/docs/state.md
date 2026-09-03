# State

No global state library. State is split by lifetime:

| Concern | Where | Survives navigation? | Survives reload? |
|---|---|---|---|
| Search query, row selection, current tab | `useState` in the page | ❌ | ❌ |
| AI panel open, attached AI context, secondary-nav choice | `AppShellContext` | ✅ | ❌ |
| Identity Manager "Preview as" role | `AppShellContext` + `localStorage` (`ars.identity.role`) | ✅ | ✅ |
| User edits | `UsersContext` (in-memory) | ✅ | ❌ |
| Theme (dark default), sidebar pin, sidebar view | `localStorage` (`ars.theme`) | ✅ | ✅ |
| AI conversations list (per vertical, 50 max) | `localStorage` via [chatHistoryStore.ts](../src/lib/chatHistoryStore.ts) | ❌ | ✅ |
| AI chat in progress (current transcript) | `useState` in `AiPanel` | ❌ | ❌ |

The in-progress transcript is saved to the conversations list on every change, so even a mid-conversation navigation away can be resumed by opening the panel and picking the row from **Chat history**. See [A2](architecture.md#a2--ai-panel-remounts-on-every-navigation).
