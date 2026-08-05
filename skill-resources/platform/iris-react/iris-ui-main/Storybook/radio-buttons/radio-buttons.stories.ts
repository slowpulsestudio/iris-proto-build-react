// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { IrisRadioButtonComponent } from '@iris-ui/lib/radio-buttons/radio-button.component';
import { IrisRadioGroupComponent } from '@iris-ui/lib/radio-buttons/radio-group.component';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<IrisRadioGroupComponent> = {
  title: 'Inputs/RadioButtons',
  component: IrisRadioGroupComponent,
  tags: ['preview'],
  argTypes: {
    size: {
      description: 'Controls the visual size of all radio buttons in the group.',
      control: 'select',
      options: ['sm', 'md'],
      table: { type: { summary: "'sm' | 'md'" }, defaultValue: { summary: "'sm'" } },
    },
    disabled: {
      description: 'Prevents interaction on all radio buttons in the group when `true`.',
      control: 'boolean',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    value: {
      description: 'Value of the currently selected radio button. Supports two-way binding via `[(value)]`.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: '' } },
    },
    selectionChange: {
      description: 'Emits the value of the newly selected radio button whenever the selection changes.',
      table: { type: { summary: 'string' }, defaultValue: { summary: '' }, category: 'outputs' },
    },
    ariaLabel: {
      description:
        'Accessible label for the radiogroup, announced by screen readers. Required for WCAG 4.1.2 — a radiogroup without a label has no accessible name.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: '' }, category: 'Accessibility' },
    },
  },
};

export default meta;
type Story = StoryObj<IrisRadioGroupComponent>;

export const Overview: Story = {
  args: { size: 'sm', disabled: false },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
    disabled: { control: 'boolean' },
    value: { table: { disable: true } },
  },
  decorators: [moduleMetadata({ imports: [IrisRadioButtonComponent] })],
  render: (args) => ({
    props: args,
    template: `
      <iris-radio-group [size]="size" [disabled]="disabled" value="a">
        <iris-radio-button value="a">Option A</iris-radio-button>
        <iris-radio-button value="b">Option B</iris-radio-button>
        <iris-radio-button value="c">Option C</iris-radio-button>
      </iris-radio-group>
    `,
  }),
};

export const Default: Story = {
  decorators: [moduleMetadata({ imports: [IrisRadioButtonComponent] })],
  render: () => ({
    template: `
      <iris-radio-group value="a">
        <iris-radio-button value="a">Option A</iris-radio-button>
        <iris-radio-button value="b">Option B</iris-radio-button>
        <iris-radio-button value="c">Option C</iris-radio-button>
      </iris-radio-group>
    `,
  }),
};

export const Medium: Story = {
  decorators: [moduleMetadata({ imports: [IrisRadioButtonComponent] })],
  render: () => ({
    template: `
      <iris-radio-group size="md" value="a">
        <iris-radio-button value="a">Option A</iris-radio-button>
        <iris-radio-button value="b">Option B</iris-radio-button>
        <iris-radio-button value="c">Option C</iris-radio-button>
      </iris-radio-group>
    `,
  }),
};

export const WithSupportingText: Story = {
  decorators: [moduleMetadata({ imports: [IrisRadioButtonComponent] })],
  render: () => ({
    template: `
      <iris-radio-group value="standard">
        <iris-radio-button value="standard" supportingText="Best for everyday use.">Standard</iris-radio-button>
        <iris-radio-button value="express" supportingText="Faster delivery, higher cost.">Express</iris-radio-button>
        <iris-radio-button value="economy" supportingText="Slowest option, lowest cost.">Economy</iris-radio-button>
      </iris-radio-group>
    `,
  }),
};

export const Disabled: Story = {
  decorators: [moduleMetadata({ imports: [IrisRadioButtonComponent] })],
  render: () => ({
    template: `
      <iris-radio-group disabled="true" value="a">
        <iris-radio-button value="a">Option A</iris-radio-button>
        <iris-radio-button value="b">Option B</iris-radio-button>
        <iris-radio-button value="c">Option C</iris-radio-button>
      </iris-radio-group>
    `,
  }),
};

export const DisabledOption: Story = {
  decorators: [moduleMetadata({ imports: [IrisRadioButtonComponent] })],
  render: () => ({
    template: `
      <iris-radio-group value="a">
        <iris-radio-button value="a">Option A</iris-radio-button>
        <iris-radio-button value="b" [disabled]="true">Option B (unavailable)</iris-radio-button>
        <iris-radio-button value="c">Option C</iris-radio-button>
      </iris-radio-group>
    `,
  }),
};
