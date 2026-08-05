// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { IrisButtonComponent } from '@iris-ui/lib/button/button.component';
import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta<IrisButtonComponent> = {
  title: 'Actions/Button',
  component: IrisButtonComponent,
  tags: ['preview'],
  argTypes: {
    disabled: {
      description: 'Prevents interaction when `true`.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    iconName: {
      description: "Icon identifier to display; only used when `buttonType` is `'icon-text'` or `'icon-only'`.",
      control: 'text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
        category: 'Icon',
      },
    },
    variant: {
      description: 'Visual style of the button.',
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
      table: {
        type: { summary: "'primary' | 'secondary' | 'ghost' | 'danger'" },
        defaultValue: { summary: 'primary' },
      },
    },
    buttonType: {
      description: 'Determines whether the button shows text only, an icon with text, or an icon only.',
      control: 'select',
      options: ['text-only', 'icon-text', 'icon-only'],
      table: {
        type: { summary: "'text-only' | 'icon-text' | 'icon-only'" },
        defaultValue: { summary: 'text-only' },
      },
    },
    size: {
      description: "Controls the button's height and font size.",
      control: 'select',
      options: ['sm', 'default', 'lg'],
      table: {
        type: { summary: "'sm' | 'default' | 'lg'" },
        defaultValue: { summary: 'default' },
      },
    },
    type: {
      description: 'Native HTML button type attribute; controls form submission behavior.',
      control: 'select',
      options: ['button', 'submit', 'reset'],
      table: {
        type: { summary: "'button' | 'submit' | 'reset'" },
        defaultValue: { summary: 'button' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<IrisButtonComponent>;

export const Overview: Story = {
  args: { size: 'default', disabled: false },
  argTypes: {
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
    disabled: { control: 'boolean' },
    buttonType: { table: { disable: true } },
    variant: { table: { disable: true } },
    iconName: { table: { disable: true } },
    type: { table: { disable: true } },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div style="display:flex;gap:8px;align-items:center;">
          <iris-button variant="primary"   [size]="size" [disabled]="disabled">Primary</iris-button>
          <iris-button variant="primary"   [size]="size" [disabled]="disabled" buttonType="icon-text" iconName="Confetti">Primary</iris-button>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <iris-button variant="secondary" [size]="size" [disabled]="disabled">Secondary</iris-button>
          <iris-button variant="secondary" [size]="size" [disabled]="disabled" buttonType="icon-text" iconName="Confetti">Secondary</iris-button>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <iris-button variant="ghost"     [size]="size" [disabled]="disabled">Ghost</iris-button>
          <iris-button variant="ghost"     [size]="size" [disabled]="disabled" buttonType="icon-text" iconName="Confetti">Ghost</iris-button>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <iris-button variant="danger"    [size]="size" [disabled]="disabled">Danger</iris-button>
          <iris-button variant="danger"    [size]="size" [disabled]="disabled" buttonType="icon-text" iconName="Confetti">Danger</iris-button>
        </div>
      </div>
    `,
  }),
};

export const Primary: Story = {
  args: { variant: 'primary', size: 'default' },
  render: (args) => ({ props: args, template: `<iris-button [variant]="variant" [size]="size">Button</iris-button>` }),
};

export const Secondary: Story = {
  args: { variant: 'secondary', size: 'default' },
  render: (args) => ({ props: args, template: `<iris-button [variant]="variant" [size]="size">Button</iris-button>` }),
};

export const Danger: Story = {
  args: { variant: 'danger', size: 'default' },
  render: (args) => ({ props: args, template: `<iris-button [variant]="variant" [size]="size">Button</iris-button>` }),
};

export const Ghost: Story = {
  args: { variant: 'ghost', size: 'default' },
  render: (args) => ({ props: args, template: `<iris-button [variant]="variant" [size]="size">Button</iris-button>` }),
};

export const Small: Story = {
  args: { variant: 'primary', size: 'sm' },
  render: (args) => ({ props: args, template: `<iris-button [variant]="variant" [size]="size">Button</iris-button>` }),
};

export const Default: Story = {
  args: { variant: 'primary', size: 'default' },
  render: (args) => ({ props: args, template: `<iris-button [variant]="variant" [size]="size">Button</iris-button>` }),
};

export const Large: Story = {
  args: { variant: 'primary', size: 'lg' },
  render: (args) => ({ props: args, template: `<iris-button [variant]="variant" [size]="size">Button</iris-button>` }),
};

export const Disabled: Story = {
  args: { variant: 'primary', disabled: true },
  render: (args) => ({
    props: args,
    template: `<iris-button [variant]="variant" [disabled]="disabled">Button</iris-button>`,
  }),
};

export const IconAndText: Story = {
  args: { variant: 'primary', buttonType: 'icon-text', iconName: 'Confetti' },
  render: (args) => ({
    props: args,
    template: `<iris-button [variant]="variant" [buttonType]="buttonType" [iconName]="iconName">Button</iris-button>`,
  }),
};

export const IconOnly: Story = {
  args: { variant: 'primary', buttonType: 'icon-only', iconName: 'Confetti', size: 'default' },
  render: (args) => ({
    props: args,
    template: `
      <iris-button variant="primary"   [size]="size" buttonType="icon-only" iconName="Confetti">Add item</iris-button>
    `,
  }),
};
