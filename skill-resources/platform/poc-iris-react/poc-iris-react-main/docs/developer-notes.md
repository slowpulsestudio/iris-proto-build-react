# Developer notes

## D1 — Conventions worth keeping

- **CSS Modules + tokens only.** No utility CSS, no inline colours. Themes work without per-component overrides.
- **`.js` import specifiers from `.ts` files.** Vite + the tsconfig (`module: ESNext`, `moduleResolution: Bundler`) accept them.
- **Stateless components, smart pages.** Components never reach into context.
- **Discriminated unions** for routes, AI messages, services, AI attachments.

## D2 — TS strict mode is off

[tsconfig.json](../tsconfig.json) sets `strict: false`, `noImplicitAny: false`. The codebase is mostly well-typed in practice; flipping `strict` on would catch implicit `any` in handlers and untyped router lookups. One short fix-up pass should clear it.

## D3 — No tests

First tests worth writing:
- `router.ts → parseHash()` — pure function, drives everything.
- `usersStore → updateUser()` — has derived-field logic.
- `sliceMessage()` in `AiPanel` — streaming edge cases.
- `verticalForRoute()` — easy to break silently.

Suggested: Vitest + React Testing Library.

## D4 — No lint / format

No ESLint, no Prettier, no pre-commit hook. Minimum useful add: ESLint + `eslint-plugin-react-hooks` to catch missing dependency arrays. Files where this matters most: `AiPanel`, `AppShell`, `Modal`, `SideSheet`.

## D5 — Hand-built overlays

`Modal`, `SideSheet`, `Menu`, `Tabs`, `SegmentedControl` are bespoke — no Radix/HeadlessUI. Pros: zero deps, full token control. Cons: a11y edge cases (focus trap, roving tabindex, `aria-activedescendant`) are easy to miss. Worth one axe-core pass before any production launch.

## D6 — Mocks live next to views

[mockUsers.ts](../src/views/UsersPage/mockUsers.ts), [mockInsights.ts](../src/views/InsightsPage/mockInsights.ts), [mockServices.ts](../src/views/ServicesPage/mockServices.ts). Swap one file per page when wiring a real backend.

## D7 — Known data-model leak

`InsightsPage` overlays `RecentUserActivity` onto `User` objects so "recent activity" rows link to valid detail pages. `mockInsights.ts` must keep its ids in sync with `mockUsers.ts`. Document or assert at build time.

## D8 — Hand-rolled tiny utilities

- `cx.ts` instead of `classnames`/`clsx` (~10 lines).
- `router.ts` instead of `react-router` (~110 lines).
- Theme persistence instead of `next-themes`.

Small, contained, easy to swap. Keep them.

## D9 — Standalone contrast checkers

`scripts/a11y-audit.ts` and `scripts/a11y-verify.ts` (backed by `scripts/wcag.ts`) check WCAG 2.2 Level AA contrast for the seven "more themes". They are node scripts (`node scripts/a11y-audit.ts`), not wired to any `package.json` script, and run against hard-coded token values rather than the live CSS.

## D10 — Motion rules

Following the `animate` skill ([skills/animate](../skills/animate/SKILL.md)):

- **Curves come from tokens.** `--oi-motion-ease-emphasized` (`cubic-bezier(0.23, 1, 0.32, 1)`) is the strong ease-out for UI; `--oi-motion-ease-drawer` for sheets. `--oi-motion-ease-default`/`enter`/`exit` all resolve to the emphasized curve — never the weak built-ins, never `ease-in` on UI. Don't hand-roll `cubic-bezier(...)` in a component.
- **Animate `transform`/`opacity`/`filter`/`clip-path` only.** The sidebar `width` and accordion `height` transitions are the sanctioned layout exceptions (no transform equivalent).
- **Every animation ships a `prefers-reduced-motion` fallback** (gentler, not zero) and keyboard-initiated 100+/day actions (⌘K/⌘B/⌘/) stay unanimated.
- `pnpm motion:lint` ([scripts/motion-lint.ts](../scripts/motion-lint.ts)) fails the build on `transition: all`, `scale(0)` entrances, built-in `ease-in`, or the retired forked curve.
