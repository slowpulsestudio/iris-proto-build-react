# Writing Stories for Iris UI

Stories live in `Storybook/<component-name>/<component-name>.stories.ts`.

---

## The one rule

Iris UI components use `ChangeDetectionStrategy.OnPush`. Storybook 10 + Angular 20
does **not** reliably bind `this` when you mutate state inside `render()+props`
callbacks. If a component emits events and you need the UI to react, **always use a
wrapper component** — never mutate `props` directly in event handlers.

---

## Minimal template — display-only component (no events)

Use this when the component has no `@Output()` events (pure display, configured only
by inputs).

```ts
import type { Meta, StoryObj } from '@storybook/angular';
import { IrisButtonComponent } from '../../Components/src/lib/button/button.component';

const meta: Meta<IrisButtonComponent> = {
  title: 'Components/Button',
  component: IrisButtonComponent,
  tags: ['stable'],
};

export default meta;
type Story = StoryObj<IrisButtonComponent>;

export const Default: Story = {
  render: () => ({
    template: `<iris-button label="Click me"></iris-button>`,
  }),
};

export const Disabled: Story = {
  render: () => ({
    template: `<iris-button label="Disabled" [disabled]="true"></iris-button>`,
  }),
};
```

---

## Full template — interactive OnPush component (with events)

Use this when the component emits `@Output()` events and the UI must react to them
(e.g. toggle checked, change selection).

```ts
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IrisWidgetComponent, IrisWidgetItem } from '../../Components/src/lib/widget/widget.component';

// ── 1. Wrapper component ──────────────────────────────────────────────────────
// Default CD, owns the mutable state.
// Receives the initial state via @Input(), copies it in ngOnInit(),
// and replaces it with a new reference on every event.

@Component({
  selector: 'story-widget-wrapper',
  standalone: true,
  imports: [IrisWidgetComponent],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <iris-widget
      [item]="item"
      (selectedChange)="onSelectedChange($event)"
    ></iris-widget>
  `,
})
class StoryWidgetWrapperComponent implements OnInit {
  @Input() initialItem!: IrisWidgetItem;
  item!: IrisWidgetItem;

  ngOnInit(): void {
    this.item = { ...this.initialItem };
  }

  onSelectedChange(selected: boolean): void {
    this.item = { ...this.item, selected }; // new reference → OnPush re-renders
  }
}

// ── 2. Meta ───────────────────────────────────────────────────────────────────

const meta: Meta<StoryWidgetWrapperComponent> = {
  title: 'Components/Widget',
  component: IrisWidgetComponent,   // ← real component (used for Docs/API tab)
  tags: ['preview'],                // ← 'preview' or 'stable' (see Tags below)
  decorators: [
    moduleMetadata({ imports: [StoryWidgetWrapperComponent] }),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Short description of what `IrisWidget` does.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<StoryWidgetWrapperComponent>;

// ── 3. Story helper ───────────────────────────────────────────────────────────
// Keeps render() DRY when most stories differ only by initial data.

const baseItem: IrisWidgetItem = { id: '1', label: 'Example', selected: false };

function widgetStory(initial: IrisWidgetItem): Story {
  return {
    render: () => ({
      template: `<story-widget-wrapper [initialItem]="initialItem"></story-widget-wrapper>`,
      props: { initialItem: initial },
    }),
  };
}

// ── 4. Stories ────────────────────────────────────────────────────────────────

export const Default  = widgetStory(baseItem);
export const Selected = widgetStory({ ...baseItem, selected: true });
```

---

## Tags

| Tag | Meaning |
|---|---|
| `'preview'` | Component is work-in-progress — shows a yellow banner in Storybook |
| `'stable'` | Component has been reviewed — no banner |

Set `tags: ['preview']` while building; switch to `'stable'` after sign-off.

---

## Wrapper pattern rules

| Do | Don't |
|---|---|
| Copy `@Input()` to a plain property in `ngOnInit()` | Mutate the `@Input()` directly |
| Replace state with a **new object/array reference** in event handlers | Push into an existing array or mutate a property |
| Use `ChangeDetectionStrategy.Default` on the wrapper | Make the wrapper `OnPush` |
| Keep the wrapper in the same `.stories.ts` file | Export it or place it in `Components/` |

---

## File layout

```
Storybook/
  <component-name>/
    <component-name>.stories.ts   ← stories + argTypes
    <component-name>.docs.mdx     ← human-readable docs page
```

No test files, no style files — stories and MDX docs only.

---

## Checklist before committing a story

- [ ] `meta.component` points to the **real** Iris component (not the wrapper)
- [ ] Wrapper selector is prefixed `story-` to avoid collisions
- [ ] `tags` set to either `'preview'` or `'stable'`
- [ ] `parameters.docs.description.component` filled in
- [ ] Storybook starts without console errors (`pnpm run storybook:start`)
