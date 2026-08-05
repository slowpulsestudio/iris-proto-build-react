// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { Component, computed, signal } from '@angular/core';
import { IrisIconComponent } from '@iris-ui/lib/icon/icon.component';
import type { IconSize } from '@iris-ui/lib/icon/icon.model';
import { icons } from '@oneidentity/iris-ui-icons';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<IrisIconComponent> = {
  title: 'Display/Icon',
  component: IrisIconComponent,
  tags: ['preview'],
  argTypes: {
    name: {
      description: 'Icon name from the `@oneidentity/iris-ui-icons` package.',
      control: 'text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
    },
    size: {
      description: 'Icon size in pixels.',
      control: 'select',
      options: [16, 20, 24] as IconSize[],
      table: {
        type: { summary: '16 | 20 | 24' },
        defaultValue: { summary: '24' },
      },
    },
    label: {
      description:
        'Accessible label for the icon. When not provided, the icon name is used as the accessible label automatically.',
      control: 'text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<IrisIconComponent>;

const iconsByCategory = Object.entries(
  icons.reduce<Record<string, string[]>>((accumulator, icon) => {
    (accumulator[icon.category] ??= []).push(icon.name);
    return accumulator;
  }, {}),
).sort(([a], [b]) => a.localeCompare(b));

@Component({
  selector: 'story-iconography',
  standalone: true,
  imports: [IrisIconComponent],
  template: `
    <div style="display:flex;justify-content:center;margin-bottom:24px;">
      <input type="search" placeholder="Search icons…" (input)="query.set($any($event.target).value)" />
    </div>
    @for (group of filtered(); track group[0]) {
      <h3
        style="font-family:var(--oi-font-family-default);font-size:var(--oi-font-size-l);font-weight:var(--oi-font-weight-600);color:var(--oi-content-color-primary);margin:24px 0 12px;"
      >
        {{ group[0] }}
      </h3>
      <div style="display:flex;flex-wrap:wrap;gap:16px;margin:1.5rem 0.5rem;justify-content:center;">
        @for (iconName of group[1]; track iconName) {
          <div style="display:flex;flex-direction:column;align-items:center;gap:0.75rem;width:80px;">
            <iris-icon [name]="iconName" [size]="24" [label]="iconName" [decorative]="true"></iris-icon>
            <span
              style="font-size:11px;line-height:1.2;color:var(--oi-content-color-tertiary);text-align:center;overflow-wrap:normal;"
              [innerHTML]="formatName(iconName)"
            ></span>
          </div>
        }
      </div>
    }
    @if (filtered().length === 0) {
      <p style="color:var(--oi-content-color-tertiary);font-family:var(--oi-font-family-default);">
        No icons match "{{ query() }}".
      </p>
    }
  `,
})
class IconographyWrapperComponent {
  readonly query = signal('');
  readonly filtered = computed(() => {
    const queryValue = this.query().toLowerCase().trim();
    if (!queryValue) {
      return iconsByCategory;
    }
    return iconsByCategory
      .map(
        ([category, names]) =>
          [category, names.filter((name) => name.toLowerCase().includes(queryValue))] as [string, string[]],
      )
      .filter(([, names]) => names.length > 0);
  });
  formatName(name: string): string {
    return name.replace(/(?!^)([A-Z])/g, '<wbr>$1');
  }
}

export const Iconography: Story = {
  parameters: {
    controls: { disable: true },
    a11y: { disable: true },
    iris: { noBanner: true },
  },
  decorators: [moduleMetadata({ imports: [IconographyWrapperComponent] })],
  render: () => ({
    template: `<story-iconography></story-iconography>`,
  }),
};

export const Sizes: Story = {
  args: { name: 'Bell', label: 'Bell' },
  argTypes: { size: { table: { disable: true } } },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex;gap:24px;align-items:flex-end;">
        <iris-icon [name]="name" [label]="label" [size]="16"></iris-icon>
        <iris-icon [name]="name" [label]="label" [size]="20"></iris-icon>
        <iris-icon [name]="name" [label]="label" [size]="24"></iris-icon>
      </div>
    `,
  }),
};

export const Themed: Story = {
  args: { name: 'Star', size: 24 },
  argTypes: { label: { table: { disable: true } } },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex;gap:16px;align-items:center;">
        <iris-icon [name]="name" [label]="name" [size]="size" style="color:var(--oi-content-color-brand)"></iris-icon>
        <iris-icon [name]="name" [label]="name" [size]="size" style="color:var(--oi-content-color-success)"></iris-icon>
        <iris-icon [name]="name" [label]="name" [size]="size" style="color:var(--oi-content-color-warning)"></iris-icon>
        <iris-icon [name]="name" [label]="name" [size]="size" style="color:var(--oi-content-color-error)"></iris-icon>
        <iris-icon [name]="name" [label]="name" [size]="size" style="color:var(--oi-content-color-secondary)"></iris-icon>
      </div>
    `,
  }),
};

export const WithAccessibleLabel: Story = {
  args: { name: 'Lock', size: 24, label: 'Locked' },
};
