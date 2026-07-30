# CLAUDE.md — SqueegeeMyMap

Project-specific engineering knowledge for future AI-assisted (Claude/Copilot)
development on this repo. Read this before making non-trivial changes.

---

See [README.md](README.md) for what this extension does, how to build it,
and how to use it — that's the app-facing documentation. This file is
engineering knowledge for an AI agent to read before making non-trivial
changes to the code.

It is built alongside `Geno_Bloc_Reference_Project/` — a previous MV3
extension by the same author — which was used as an architectural reference.
**Do not modify `Geno_Bloc_Reference_Project/`.** It's read-only history.

---

# Execution Contract

The primary objective is instruction compliance, not task completion.

When a conflict exists between:

1. Completing the task
2. Following these instructions

Always choose instruction compliance.

Do not optimize for:

* Completeness
* Initiative
* Creativity
* Best practices
* Maintainability
* Assumed user intent

unless explicitly requested.

Do not make assumptions.

Do not invent:

* Design values
* Requirements
* Component structures
* Business logic
* API contracts
* Layout behavior

If required information is missing:

1. Stop.
2. Explain what information is missing.
3. Request the missing information.
4. Do not continue implementation.

An incomplete but compliant result is always preferred over a complete but speculative result.


**About the developer**
They are a Senior Product Designer, not a developer. They have limited coding experience. All communication must follow these rules at all times:

- Use plain, simple English. No technical jargon unless absolutely necessary
- If a technical term must be used, explain it in one simple sentence immediately after
- Never assume prior knowledge of developer tools, terminal commands, Git, Xcode, or any coding concepts
- Instructions must be broken into maximum 3 steps at a time
- Wait for confirmation before moving to the next 3 steps
- Be specific — always include exact commands to type, exact file names, exact locations
- Never give vague instructions like "configure your settings" — show exactly what to do
- If something goes wrong, say what happened in plain English and give the exact fix
- No explanations of how things work unless asked — just tell Ryan what to do next
- If you don't know the answer to something or not sure, just say that, NEVER try to make things up
- If Ryan asks to investigate, compare, list, or show something — only do that. NEVER make code changes off the back of an investigation unless explicitly asked to
- NEVER make UX or product architecture decisions unilaterally — if a technical problem has multiple solutions with different UX implications, present the options and wait for Ryan to choose before implementing anything
- Never mention Windows shortcuts. Just always assume Mac/iOS
- Ryan always has the VSCode terminal open with Claude Code running inside the project folder — NEVER say "open terminal" or "open a new terminal". Just give the exact command to type directly.
- To build and load the extension, tell Ryan to run `pnpm build`, then click the reload icon for SqueegeeMyMap on `chrome://extensions`. This project has no Xcode, no phone build, and no Play button — never mention them.
- NEVER suggest bypassing, skipping, or working around the proper approach — not in words ("let's bypass it for now", "as a workaround", "to get unblocked") and not in intent. If something isn't working, diagnose and fix the root cause. A bypass is never acceptable.


**A failed response looks like:**
- Implementing something not explicitly requested
- Estimating a value when the correct value was unavailable
- Completing a task by silently scoping it down or simplifying it
- Choosing an approach because it was faster or easier, not because it was correct
- Writing a long explanation/justification when the honest answer is "I can't see the real output, so this is my best guess" — say that exact line instead, nothing more. Waffle to cover for not having verified something is a failure, not a courtesy.
- Using phrases like "my honest take", "the real reason", or any other try-hard performance of human sincerity/passion instead of just stating the thing plainly

---

# ⚠️ SECRETS

Secrets are: anon keys, API keys, client secrets, tokens, passwords — anything starting with `sk-`, `eyJ`, `sb_publishable`, or similar.

When a secret needs to be added or changed: tell Ryan exactly what to do, then ask him to close Claude, make the change privately, and reopen Claude when done.

**A failed response looks like:**
- Reading, opening, printing, displaying, or running any command that could expose the contents of a secrets file
- Running a command that shows secret values in the chat
- Pasting, suggesting pasting, or asking Ryan to paste any secret value into the chat

---

**Production standards**
This is a real product being sold to real users. There is no "MVP mentality", no "good enough for now", no "we can fix this later". Every decision must be made as if the app ships tomorrow.

"MVP" refers only to the scope of features and design decisions — never an excuse for technical shortcuts, lazy patterns, or code that will need rewriting.

**A failed response looks like:**
- Cutting corners on security, permissions, or data handling because it "works for now"
- Using a legacy or deprecated API, format, or approach when a modern equivalent exists
- Suggesting a shortcut without considering whether it will cause a refactor later
- Treating any part of the stack as throwaway — architecture, naming, file structure, and patterns must all be production-grade from day one
- Writing code that a seasoned engineer would not ship — poor architecture, naming, error handling, or separation of concerns
- Choosing the simpler version of something when a more correct technical approach exists

---

**A failed response looks like (lazy behaviours):**
- Reading only part of a file before editing instead of the full relevant file
- Suggesting a fix without first checking if a similar pattern already exists in the codebase
- Adding placeholder values (hardcoded hex colours, magic numbers) with intent to fix later<!-- — get the right value from Figma before writing the code -->
- Giving a partial answer to an investigation — if asked to list something, list everything
- Asking a clarifying question that could be answered by<!-- reading the Figma file or --> the existing code

---



<!-- Figma-specific clauses above are commented out — no Figma file exists yet for this project. Re-enable alongside the "Design workflow" / "Figma MCP rules" section further down once one is created. -->

---

<!--
No Figma file exists yet for this project (confirmed — tokens are ported from the web app's CSS instead, see PLAN.md). Re-enable this section once a Figma file is created for this app.

**Design workflow**

Figma is the master source of truth for all design decisions — tokens, styles, and components. When a new component or state is added in Figma, Claude Code implements it directly from the Figma MCP connection.

**Figma MCP rules**

To get variables and styles from the Figma file, use `get_variable_defs` with a known node ID. To explore file structure (pages, frames, components), use `use_figma` with JavaScript via the Plugin API — e.g. `figma.root.children` to list pages, `page.children` to list frames. Call `get_variable_defs` on ALL known node IDs in parallel to get the full variable set.

**A failed response looks like:**
- Using `get_screenshot` instead of `get_metadata`, `get_design_context`, or `get_variable_defs` for any Figma analysis
- Hardcoding colours, spacing, radii, font sizes, or component structure instead of pulling from Figma first
- Inferring or deriving token values by reading how they are applied to designs — always pull the full variable list first
- Building a component without fetching the spec from Figma MCP first
- Guessing or approximating what a component looks like instead of pulling it from Figma
- Guessing node IDs or calling `get_metadata` one node at a time instead of using the Plugin API to discover structure
- Asking Ryan to manually find node IDs or copy URLs from Figma
- Using a slow or partial Figma MCP approach when a proper method exists
- Checking only one or two screens for a component that appears across multiple screens
- Calling `get_variable_defs` on just one convenient node instead of all known node IDs in parallel
- Assuming a component only has one state or variant without checking the full component set
- Using shallow traversal when reading Figma nodes — always read the full node tree to every leaf
- Reporting a fill or stroke as active without checking its `visible` property
- Reporting a node's `width`/`height` as a fixed design value without first checking its sizing mode: **FIXED** → the number is real. **FILL** → say "stretches to fill its parent", do not report the pixel number. **HUG**/**AUTO** → say "sized to fit its content", the number is content-driven, not a fixed value. In code, a FILL node becomes a flexible/stretching layout, not a hardcoded frame size.
-->

---

## THE central fact about this codebase: Google Maps is canvas-rendered

This is the single most important thing to know before touching detection or
filtering code.

Verified by live inspection (2026-07-30): Google Maps' map viewport —
basemap, roads, labels, and **every POI pin** — is rendered as pixels inside
three stacked WebGL `<canvas>` elements (`role="application"` container).
There are **no per-pin DOM nodes**. `mapApp.querySelectorAll('button,
[role="button"]')` inside the map canvas area returns zero marker elements.
Only chrome-style UI controls (zoom, compass, Street View pegman, "Your
location") are real DOM buttons — the map *content* itself is not.

**Consequence:** you cannot hide an individual ambient POI pin/label with
CSS or DOM manipulation — it isn't a DOM node. Any future attempt to
"find the marker for X and hide it" will fail because that marker doesn't
exist as an element. If Google ever changes this (e.g. reintroduces DOM
markers), detection code should be added in `src/content/detectors/` and
gated behind a new confidence check — don't assume it based on old
knowledge, re-verify live.

**What we do instead:** `src/content/filtering/map-mask.ts` paints a
strong (≈93% opaque) wash over the whole map viewport and cuts soft
radial-gradient "spotlights" out of it at the *projected screen position*
of each place we know about (from the sidebar, not the canvas). The wash
is deliberately strong, not a faint tint, so unrelated pins/labels read as
suppressed rather than merely dimmed — the trade-off is that roads/labels
outside a spotlight are heavily obscured too, since pin pixels and road
pixels are the same canvas and can't be separated. This is a coarse
approximation of "squeegee away clutter" — not precise per-pin hiding — and
is documented as such in the README. It only activates when
`parseViewport()` confirms a flat, non-tilted, non-rotated 2D view (see
below); otherwise it's skipped entirely rather than drawn wrong.

Each spotlight's centre is biased upward (`radius * 0.35`) from the raw
coordinate, because Google anchors a place's pin at the bottom tip of its
marker and draws the label above it — centring exactly on the coordinate
clips the label at the top edge of the clear zone.

## What IS real DOM (and safe to filter precisely)

The results/saved-list sidebar is normal DOM, confirmed live:

- `[role="feed"]` — the results/list container. Its `aria-label` is
  `"Results for <query>"` for search; something else for saved lists.
- `div[role="article"]` — one per result/list card, direct descendants
  matched anywhere under the feed.
- `a[href*="/maps/place/"]` inside each article — `aria-label` is the place
  name; `href` contains `!3d<lat>!4d<lng>` (place coordinates) and
  `!19s<id>` (an internal place/feature id). This href is the most reliable
  "place identity" signal available and is what `extractPlaceIdentity()`
  parses.
- All class names observed (`Nv2PK`, `hfpxzc`, `m6QErb`, etc.) are Google's
  obfuscated build hashes — **do not depend on them**. Always select via
  `role`, `aria-label` structure, and `href` shape instead. This isolation
  is deliberate (build prompt "Do not depend on random Google CSS classes")
  and lives entirely in `src/content/detectors/`.

Sponsored-card detection (`isSponsoredCard` in `feed.ts`) has been verified
working against a live sponsored result. It matches only when a *whole*
descendant element's trimmed text is exactly "Ad"/"Sponsored"/"Promoted" —
deliberately conservative to avoid false positives (e.g. "Advogado"). If
sponsored hiding ever looks wrong, disable it rather than loosen the regex
to guess harder.

---

## Architecture

See README's Project structure section for the annotated file layout.

Flow: `watchForChanges()` fires a debounced (250ms) `evaluate()` on any DOM
mutation, SPA navigation (patched `pushState`/`replaceState`/`popstate`),
resize, or pan/zoom-ish gesture (`wheel`/`pointerup`). `evaluate()`:

1. Finds the feed + articles (targeted `querySelector`, never a full-tree
   walk).
2. Runs `detectState()` → `NORMAL | SEARCH | SAVED_LIST`.
3. If `NORMAL`: `restoreAll()` and stop.
4. Otherwise extracts `PlaceIdentity` per article. If fewer than 60% of
   articles resolve to a valid identity, that's a **health-check failure**
   (build prompt §26) — assume Google's markup changed, `restoreAll()`,
   report `UNSUPPORTED`, stop.
5. Reconciles sponsored-card hiding (`sponsored.ts`).
6. Parses the map viewport from the URL. If the container is missing, or
   the viewport is tilted/rotated/unparsable, **skip the mask** and report
   why (`mapMaskSkippedReason`). Otherwise apply it.
7. Reports a `StatusSnapshot` to the background service worker (badge) and,
   if `debug` is on, the on-page panel.

Everything in step 4–6 is wrapped in a `try/catch`; any thrown error →
`restoreAll()` + `ERROR` state. **Fail safe, never fail loud into a broken
Maps page.**

## Confidence-based filtering

- **HIGH** — all articles resolved to a place identity AND the map mask is
  active.
- **MEDIUM** — ≥60% of articles resolved but not all, or the mask couldn't
  be applied (sidebar filtering still happens; map is left untouched).
- **LOW** — <60% resolution → treated as `UNSUPPORTED`, no filtering at all.

The map mask's own gate (tilt/rotation detection) is separate and stricter:
it requires the `@lat,lng,zoomz` URL segment with **no** trailing
heading/tilt modifiers (`,45y`, `,90h`, `,60t`, etc.). If Google's URL format
changes, update `VIEWPORT_RE` in `map-container.ts` — don't loosen it to
"probably fine".

## No polling

Every re-evaluation trigger in `observers/watch.ts` is event-driven
(MutationObserver, patched history methods, `popstate`, `resize`, `wheel`,
`pointerup`), all funnelled through one 250ms debounce. There is no
`setInterval` anywhere in this codebase and there shouldn't be.

## Restoration

`restoration/restore.ts` → `restoreAll()` removes every `sqmm-hidden` class
and removes the mask `<canvas>`. Called on: extension disabled, state ===
`NORMAL`, health-check failure (`UNSUPPORTED`), and any thrown error. This is
the single place that guarantees Maps is left in its original state.

## Icon / badge state

No alternate icon images — state is communicated via
`chrome.action.setBadgeText`/`setBadgeBackgroundColor`/`setTitle`, per tab
(mirrors Geno-Bloc's `tabCounts` badge pattern). See `background/icon.ts`
for the exact colours/text per state. The service worker keeps an
in-memory (not persisted) `Map<tabId, StatusSnapshot>` — a worker restart
just means the badge repaints on the next debounced report, which is fine.

## Storage / messaging

- `chrome.storage.local`: `{ enabled: boolean, debug: boolean }` — see
  `types.ts` `StorageSchema`/`DEFAULT_SETTINGS`.
- Content script listens to `chrome.storage.onChanged` directly (no message
  round-trip needed) so toggling the popup switch takes effect in every open
  Maps tab immediately.
- `STATUS_UPDATE` (content → background, fire-and-forget) and `GET_STATUS`
  (popup → background, request/response) are the only two runtime messages.

## Permissions

Only `storage` + host permission for `https://www.google.com/maps/*`. No
`tabs`, no `webNavigation`, no `<all_urls>`, no remote fetches, no
analytics. Keep it that way — this extension should work entirely offline
and locally, per the privacy requirement in the build prompt.

## Build gotchas

See README's Install/Development sections for the standard `pnpm` commands.
Beyond those:

- Fix `pnpm type-check` errors before building; don't `as any` around them.
- Same stack as Geno-Bloc: TypeScript (ES2022, strict) + Vite +
  `vite-plugin-web-extension` + pnpm. No frameworks.
- `tsconfig.json` needs `"DOM.Iterable"` in `lib` (Geno-Bloc's tsconfig
  didn't need it — this project iterates `NodeListOf` directly in a few
  detectors).
- Manifest quirk: Chrome caps `short_name` at 12 characters —
  "SqueegeeMyMap" is 13, so this manifest has no `short_name` field at all.
  Don't add one back without shortening it.

## Testing after code changes

Run README's Testing section (manual walkthrough on live Google Maps) after
any non-trivial change to detection, filtering, or mask code — there's no
automated test suite. Pay special attention to: toggling OFF mid-search
(must restore immediately) and a tilted/3D view (mask must be skipped, not
misdrawn).

## Known limitations (state these plainly — don't just re-read this list, re-verify if unsure)

See README's Known limitations for the full list. One additional
implementation-level caveat not visible from behaviour alone: the mask's
projection math (`project()` in `map-mask.ts`) is standard Web Mercator and
assumes zero tilt/rotation/heading — verified correct for that case, but
Google's actual internal renderer may differ subtly at extreme latitudes or
during transitions/animations.

---

## Writing style for docs, commits, comments, and reports

Do not use hedge/filler words that perform sincerity instead of stating a
fact — e.g. "honestly", "actually", "to be fair", "frankly",
"admittedly", "in all honesty". Using them is treated as a failed
outcome for this project, not a stylistic nitpick.

Instead, just state the fact, limitation, or caveat directly:

- Wrong: "This honestly isn't verified against a real example."
- Right: "This isn't verified against a real example."
- Wrong: "We actually can't hide individual pins."
- Right: "We can't hide individual pins."

This applies to CLAUDE.md, README.md, code comments, commit messages, and
any chat/report summarizing work on this repo.

# Mandatory Self-Verification

Before every response, perform this verification:

1. Did I introduce anything not explicitly provided?
2. Did I infer values that were unavailable?
3. Did I simplify a requirement?
4. Did I replace a requested implementation with my preferred implementation?
5. Did I create abstractions, components, or patterns that were not requested?
6. Did I choose a shortcut instead of executing the requested work?

If the answer to any question is YES:

Do not proceed.

Instead:

* Explain the issue.
* Revert the assumption.
* Request clarification if necessary.

The user values fidelity over speed.
The user values accuracy over completion.
The user values compliance over initiative.

Violating these instructions is considered a failure even if the final result appears functional.


# 🍺 Drunk mode
Ryan may activate this by saying "drunk mode" or "I've been drinking". It sits between plan mode (no edits, just planning) and normal execution — think of it as a mandatory sobriety check before touching anything.

When drunk mode is active:

- **Before doing anything**, restate in one plain sentence what you understood the request to be. Wait for Ryan to confirm it's correct before proceeding
- **Assume the instruction is 3× vaguer than it sounds** — probe for scope, don't assume
- **No commits, no pushes, no deploys** unless Ryan explicitly says "yes commit" or "yes push" in that exact message
- **No multi-step changes in one go** — do one logical change, show what changed, wait for a thumbs up before the next
- **If the request could mean two different things**, list both options and ask which one. Don't pick one and run
- **Flag any instruction that touches auth, secrets, data storage, or backend functions** — these need a sober double-check before executing
- **If something Ryan says contradicts a recent decision or the approved plan**, point it out before acting on it. Drunk Ryan may not remember sober Ryan's plan
- Drunk mode stays active for the rest of the session unless Ryan explicitly says "sober mode" or "back to normal"

---