# `@oneidentity/iris-ui`

One Identity's shared Angular component library. Built with Angular 20, published to the
One Identity Azure Artifacts feed.

---

## Installation

> **Internal package** — requires the One Identity Azure Artifacts registry.

Add the registry to your project's `.npmrc`:

```
@oneidentity:registry=https://pkgs.dev.azure.com/OneIdentity/_packaging/iris-ui/npm/registry/
```

Then install the package:

```bash
npm install @oneidentity/iris-ui
```

### Peer dependencies

| Package | Version |
|---|---|
| `@angular/core` | `>=20.0.0 <21.0.0` |
| `@angular/common` | `>=20.0.0 <21.0.0` |
| `@angular/cdk` | `>=20.0.0 <21.0.0` |

---

## Usage

Import the components you need directly — tree-shaking is fully supported:

```ts
import { IrisTaskComponent } from '@oneidentity/iris-ui';

@Component({
  imports: [IrisTaskComponent],
  template: `<iris-task [task]="myTask" />`,
})
export class MyComponent { ... }
```

### Theming

Add the theme class to your application's `<body>` element:

```html
<body class="theme-light">
  <!-- or theme-dark / theme-hc-light / theme-hc-dark -->
</body>
```

Import the token stylesheet from `@oneidentity/iris-ui-tokens` in your global styles (e.g. `styles.scss`):

```scss
@use '@oneidentity/iris-ui-tokens/dist/tokens.primitives';
@use '@oneidentity/iris-ui-tokens/dist/tokens.typography';
@use '@oneidentity/iris-ui-tokens/dist/tokens.light';
@use '@oneidentity/iris-ui-tokens/dist/tokens.dark';
@use '@oneidentity/iris-ui-tokens/dist/tokens.hc-light';
@use '@oneidentity/iris-ui-tokens/dist/tokens.hc-dark';
```

---

## Development

### Prerequisites

- Node.js 22+
- npm 11+
- Angular CLI 20: `npm install -g @angular/cli@20`

### Setup

```bash
git clone https://github.com/oi-eng/iris-ui.git
cd iris-ui
npm install
```

### Commands

| Command | Description |
|---|---|
| `pnpm run storybook:start` | Start Storybook dev server at `localhost:6006` |
| `pnpm test` | Run Vitest unit tests |
| `pnpm run lint` | ESLint + Prettier check |
| `pnpm run lint:autofix` | Auto-fix lint and formatting issues |
| `pnpm run components:build` | Build library → `Components/dist/` |
| `pnpm run storybook:build` | Build static Storybook → `Storybook/dist/` |

---

## Adding a Component

1. **Generate the files** inside `Components/src/lib/`:
   ```
   <name>/
   ├── <name>.component.ts
   ├── <name>.component.html
   ├── <name>.component.scss
   ├── <name>.component.spec.ts
   └── <name>.model.ts        ← interfaces/types
   ```

2. **Follow conventions** (see `Agent/AGENTS.md` for the full ruleset):
   - Standalone component, `OnPush` change detection
   - Selector prefix `iris-`, class prefix `Iris`
   - `@if` / `@for` control flow — never `*ngIf` / `*ngFor`
   - All colours, spacing and radii from CSS custom property tokens (`--oi-*`)
   - No hardcoded values

3. **Export through the public API** — add to `Components/src/public-api.ts`:
   ```ts
   export * from './lib/<name>/<name>.model';
   export * from './lib/<name>/<name>.component';
   ```

4. **Add a Storybook story** at `Storybook/<name>/<name>.stories.ts`.
   See `Storybook/README.md` for the wrapper pattern required by interactive OnPush components.

---

## Publishing

The package publishes to the One Identity Azure Artifacts feed. Publishing is performed by
the CI/CD pipeline — do not run `npm publish` manually.

Build the library before publishing:

```bash
ng build iris-ui
# output: Components/dist/
```

---

## Tech Stack

| Tool | Version |
|---|---|
| Angular | 20 |
| Angular CLI | 20 |
| TypeScript | 5.8 |
| Storybook | 10 |
| Vitest | 4 |
| ng-packagr | 20 |
| ESLint | 9 |
| Prettier | 3 |
