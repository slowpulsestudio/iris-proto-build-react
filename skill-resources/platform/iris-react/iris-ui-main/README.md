# Iris UI

One Identity's shared Angular component library — a design-token-driven, Figma-fed component system built on Angular 20.

---

## Prerequisites

| Tool                         | Version                                                  |
| ---------------------------- | -------------------------------------------------------- |
| Node.js                      | 22.x                                                     |
| pnpm                         | 10.x (`npm i -g pnpm`)                                   |
| Angular CLI                  | 20.x (`npm i -g @angular/cli`)                           |
| `@oneidentity/iris-ui-icons` | peer dependency — must be installed in the consuming app |

### Install dependencies

```bash
pnpm install
```

> `postinstall` automatically builds icons, components, and Storybook after install.

---

## Storybook

Storybook is the primary development environment for Iris UI. Every component gets a story before it ships.

### Start Storybook

```bash
pnpm run storybook:start
```

Opens at **http://localhost:6006** — no browser tab is opened automatically, navigate there yourself.

### Theme toggle

Use the **Theme** toolbar button (top-right of the Storybook toolbar) to switch between all four modes:

| Option              | Class applied to `body` |
| ------------------- | ----------------------- |
| Light               | `theme-light`           |
| Dark                | `theme-dark`            |
| High Contrast Light | `theme-hc-light`        |
| High Contrast Dark  | `theme-hc-dark`         |

### Component status: Preview and Stable

Every component implemented by an agent automatically carries a **Preview** badge — a fixed amber banner visible at the top of the Storybook canvas.

| Status      | Meaning                                                      |
| ----------- | ------------------------------------------------------------ |
| **Preview** | Agent-written. Passes CI. Not yet human-reviewed.            |
| **Stable**  | Human-reviewed and signed off. Safe to import into products. |

**Rule: do not import a Preview component into any product application.**
The preview badge is your signal that no human has verified the component's behaviour, accessibility, or visual quality yet.

#### How to promote a component to Stable

1. Open the component in Storybook and review all story variants (default, edge cases, light/dark).
2. Check the component's spec file — all tests should be passing.
3. If everything looks correct, open the story file (e.g. `Storybook/task-list/task-list.stories.ts`) and add `'stable'` to the `tags` array:

```ts
const meta: Meta<IrisTaskListComponent> = {
  title: 'Components/TaskList',
  tags: ['stable'],   // ← remove 'preview', add 'stable'
  ...
};
```

4. The amber banner disappears as soon as Storybook reloads with the updated tag.
5. Commit the change and open a PR — the stable tag is the human sign-off on record.

### Story location

Stories live in `Storybook/`, **not** `src/`. One folder per component:

```
Storybook/
├── task/
│   └── task.stories.ts
└── task-list/
    └── task-list.stories.ts
```

### Writing a story

See **[Storybook/README.md](Storybook/README.md)** for the full guide, including the wrapper component pattern required for interactive `OnPush` components.

Quick rules:

- `title` always follows `Components/<Name>` — controls the sidebar hierarchy.
- Display-only components (no `output()`) can use a plain `render()` with an inline template.
- Components with `output()` events **must** use a wrapper component — see the guide for the template.
- `tags: ['preview']` while building; switch to `'stable'` after human review.

### Build static Storybook (for Docker / CI)

```bash
pnpm run storybook:build
```

Output goes to `Storybook/dist/`. The `Storybook/Dockerfile` builds and serves this via nginx.

---

## Testing

```bash
# Run all tests (no watch)
npm test

# Watch mode (re-runs on file save)
ng test --watch=false

# With coverage report
ng test --watch=false --code-coverage
```

Tests use **Vitest** + the `@angular/build` unit-test builder. Test files live alongside source: `*.component.spec.ts`.

**Important — `OnPush` components:** always use `fixture.componentRef.setInput('prop', value)` instead of `component.prop = value` when changing inputs in tests, otherwise Angular won't re-render.

---

## Linting

```bash
# Check
pnpm run lint

# Auto-fix (Prettier formatting + safe ESLint rules)
pnpm run lint:autofix
```

Rules enforced:

- Angular recommended + template accessibility
- Prettier formatting (single quotes, trailing commas, 120-char line width)
- Component selector prefix: `iris-` (e.g. `iris-task`)
- Directive selector prefix: `iris` camelCase

---

## Build the library

```bash
pnpm run components:build
```

Output is written to `Components/dist/`. This is the artifact published to Azure Artifacts.

---

## Publishing

All packages publish to the One Identity Azure Artifacts npm feed via CI/CD pipelines in `pipelines/`. Do not publish manually.

### `@oneidentity/iris-ui` (Components)

| Trigger                              | What happens                                                                                        |
| ------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Push to `main`                       | Publishes a **preview** release tagged `preview` with version `<version>-preview.<BuildId>`         |
| Manual run with `stableRelease=true` | Publishes a **stable** release — fails if `package.json` version was not manually incremented first |

### `@oneidentity/iris-ui-icons` and `@oneidentity/iris-ui-tokens`

No preview releases. Stable only: trigger the pipeline manually with `stableRelease=true`. Fails if `package.json` version was not manually incremented first.

---

## Project Layout

```
iris-ui/
├── Agent/                  Agent instructions + Figma CronJob Dockerfile
├── Components/             Angular library source (ng-packagr)
│   └── src/
│       ├── lib/            One folder per component
│       │   ├── task/
│       │   │   ├── task.model.ts           ← interfaces / types
│       │   │   ├── task.component.ts
│       │   │   ├── task.component.html
│       │   │   ├── task.component.scss
│       │   │   └── task.component.spec.ts
│       │   └── task-list/
│       │       ├── task-list.model.ts      ← interfaces / types
│       │       ├── task-list.component.ts
│       │       ├── task-list.component.html
│       │       ├── task-list.component.scss
│       │       └── task-list.component.spec.ts
│       ├── styles/         Hand-authored global styles and token entry point
│       └── public-api.ts   Library public exports
├── Icons/                  Icon library source + build scripts
├── Tokens/                 Design token source (Figma JSON → SCSS)
│   ├── src/                Figma JSON exports (source of truth)
│   ├── dist/               Generated SCSS files (auto — do not edit)
│   └── scripts/            Token generation script
├── Storybook/              Storybook stories (one folder per component)
│   └── storybook-host/     Minimal Angular app — required by Storybook 10 builder
├── .storybook/             Storybook config (main.ts, preview.ts)
├── eslint.config.js        ESLint flat config (ESM)
├── setup-vitest.ts         Vitest global setup (CSS error suppression)
└── tsconfig.json           Root TypeScript config
```

---

## Design Tokens

All visual values (colour, spacing, typography, shadow, radius) are CSS custom properties defined in `Components/src/styles/`. Token names use the `--oi-` prefix and come directly from the One Identity Figma variables library.

### Token files

Token SCSS files are distributed as the `@oneidentity/iris-ui-tokens` package and consumed by the component library as a workspace dependency. Do not reference `Tokens/dist/` directly.

| File                      | Applied to                                   |
| ------------------------- | -------------------------------------------- |
| `_tokens.primitives.scss` | `:root, :host` (theme-independent primitive values) |
| `_tokens.typography.scss` | `:root, :host` (theme-independent typography scale) |
| `_tokens.light.scss`      | `body.theme-light`, `.theme-light`, `:host(.theme-light)` |
| `_tokens.dark.scss`       | `body.theme-dark`, `.theme-dark`, `:host(.theme-dark)` (full set) |
| `_tokens.hc-light.scss`   | `body.theme-hc-light`, `.theme-hc-light`, `:host(.theme-hc-light)` |
| `_tokens.hc-dark.scss`    | `body.theme-hc-dark`, `.theme-hc-dark`, `:host(.theme-hc-dark)` |

Every theme output is self-sufficient (full token set, no `:root` fallback), so a component or app that only wants dark mode can load `tokens.dark` alone and activate it via `class="theme-dark"` — no other theme has to be loaded as a base.

> **Do not edit files in `Tokens/dist/` by hand.** They are regenerated from the JSON source on every `pnpm run tokens:build`.

### Updating tokens and icons

Token and icon updates arrive as pull requests from the UX team. Review and merge the PR — the CI pipeline handles publishing automatically.

Do not manually copy Figma exports or run build scripts to update tokens or icons.

### Token categories

| Prefix                    | Category                      | Example                           |
| ------------------------- | ----------------------------- | --------------------------------- |
| `--oi-spacing-*`          | Spacing scale (4 – 48 px)     | `--oi-spacing-l: 16px`            |
| `--oi-size-*`             | Component sizing scale        | `--oi-size-default: 32px`         |
| `--oi-border-radius-*`    | Corner radius                 | `--oi-border-radius-default: 4px` |
| `--oi-border-width-*`     | Border thickness              | `--oi-border-width-default: 1px`  |
| `--oi-border-color-*`     | Border colours                | `--oi-border-color-default`       |
| `--oi-background-color-*` | Surface / fill colours        | `--oi-background-color-primary`   |
| `--oi-base-color-*`       | Brand / status accent colours | `--oi-base-color-brand`           |
| `--oi-content-color-*`    | Text / icon colours           | `--oi-content-color-primary`      |

### Using tokens in component SCSS

```scss
.my-component {
  color: var(--oi-content-color-primary);
  padding: var(--oi-spacing-l);
  border-radius: var(--oi-border-radius-default);
  border: var(--oi-border-width-default) solid var(--oi-border-color-default);
  background: var(--oi-background-color-primary);
}
```

Never hard-code colour or spacing values — always use a token.

---

## Contributing

See [Agent/AGENTS.md](Agent/AGENTS.md) for component implementation conventions (naming, file structure, story requirements, accessibility).

---

## Icons

Icons are provided by the `@oneidentity/iris-ui-icons` peer dependency. The library ships SVG strings with `currentColor` already applied — no HTTP requests, no static file serving required.

### Using an icon in a template

```html
<iris-icon name="Bell"></iris-icon>

<!-- Explicit px size (any number) -->
<iris-icon name="ArrowRight" [size]="20"></iris-icon>

<!-- Decorative (hidden from screen readers) -->
<iris-icon name="X" label=""></iris-icon>

<!-- Explicit accessible label -->
<iris-icon name="Lock" label="Account locked"></iris-icon>
```

### `IrisIconComponent` inputs

| Input   | Type             | Default        | Description                                                                                          |
| ------- | ---------------- | -------------- | ---------------------------------------------------------------------------------------------------- |
| `name`  | `string`         | — _(required)_ | Icon name from `@oneidentity/iris-ui-icons` (PascalCase, e.g. `ArrowRight`)                          |
| `size`  | `number`         | `24`           | Rendered size in px. Accepts any number.                                                             |
| `label` | `string \| null` | `null`         | `null` → use icon name as `aria-label`; `''` → `aria-hidden` decorative; any string → explicit label |

### Browsing icons

Run Storybook and open **Components › Icon › Iconography** to browse all icons grouped by category with their names.

### Theming icons

Icons inherit `color` from their parent — set `color` via CSS or inline style:

```html
<iris-icon name="CheckCircle" style="color: var(--oi-content-color-success)"></iris-icon>
```
