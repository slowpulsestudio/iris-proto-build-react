# Search, filters & keyboard

Three connected capabilities make the shell fully driveable from the keyboard: a global command palette, an advanced filter bar, and app-wide shortcuts with focus management.

## Command palette (⌘K)

A global launcher for search + navigation + actions, mounted once and toggled from anywhere with **⌘K / Ctrl+K** (or the header search button, which shows the `⌘ K` chip). See [CommandPalette.tsx](../src/components/CommandPalette/CommandPalette.tsx).

- **Fuzzy search** across pages ("Jump to"), users, and actions, with a scope switch (**All / Users / Pages**).
- **Actions** surface inline: *Toggle AI panel* and *Theme: …* switching.
- An **"Ask AI about ‘<query>’"** entry hands the typed query straight to the AI panel.
- **Recents** — recent searches and recently-viewed pages/users persist via [searchHistoryStore.ts](../src/lib/searchHistoryStore.ts) and are individually removable.
- **Fully keyboard-operable** — ↑/↓ move the active row, `Enter` commits, `Esc` closes and restores focus to the previously-focused element; the list drives `aria-activedescendant` while the input keeps focus.

## Advanced filters

The filter bar on the Users page turns loose fields into structured, chip-based filters. See [Filters.tsx](../src/components/Filters/Filters.tsx) and [UsersPage.tsx](../src/views/UsersPage/UsersPage.tsx).

- Add a filter from the toolbar funnel button (**⌘⇧F / Ctrl+Shift+F**) or the **Add** control inside the bar.
- Fields: **Display Name · Object Type · Tags · Location · Date active · Date created**. Fields without a value UI yet are shown **disabled** in the menu rather than producing an un-configurable chip.
- Each active filter renders as a **chip**: field label + rule pill + value. Values come from a menu (Object Type carries per-type icons) or a native date picker for date fields.
- **Clear** removes every chip at once.
- **Focus lands on the bar** the moment it appears: the bar is a labeled landmark (`role="region"`, `aria-label="Active filters"`) that receives focus on mount, so keyboard and screen-reader users are taken straight to the new filters.

## Keyboard shortcuts & accessibility

| Shortcut | Action | Scope |
|---|---|---|
| `⌘K` / `Ctrl+K` | Open the command palette (search) | Global |
| `⌘/` / `Ctrl+/` | Toggle the Ask AI panel | Global |
| `⌘B` / `Ctrl+B` | Toggle the global sidebar (pin/unpin) | Global |
| `⌘⇧F` / `Ctrl+Shift+F` | Open the Add filter menu | Users page |
| `⌘E` / `Ctrl+E` | Edit user properties | User detail |
| `J` / `K` | Go to next / previous user | User detail |
| `↑` `↓` `Home` `End` | Move between items in an open menu | Any menu |
| `Enter` / `Space` | Activate the focused menu item | Any menu |
| `Esc` | Close the menu / palette / overlay (restores focus) | Contextual |

Supporting focus + a11y behaviour:

- **Menus are keyboard-first.** Opening a menu moves focus to its first *enabled* item; ↑/↓/Home/End rove between items and **skip disabled entries** (matching Tab), `Enter`/`Space` selects, and `Esc` closes and returns focus to the trigger. See [Menu.tsx](../src/components/Menu/Menu.tsx).
- **Tooltips no longer fight the click.** The shared [Tooltip](../src/components/Tooltip/Tooltip.tsx) dismisses on pointer-down and suppresses the click-induced focus from re-opening it, so tapping a tooltipped button feels instant. Tooltips also render their shortcut as key chips (e.g. `⌘ B`).
- **`J`/`K` are typing-safe.** The next/previous-user keys are ignored while focus is in an `input`, `textarea`, `select`, or `contenteditable`, and when any modifier is held.
