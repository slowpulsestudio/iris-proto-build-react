// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { IrisCheckboxComponent } from '@iris-ui/lib/checkbox/checkbox.component';
import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta<IrisCheckboxComponent> = {
  title: 'Inputs/Checkbox',
  component: IrisCheckboxComponent,
  tags: ['preview'],
  argTypes: {
    checked: {
      description: 'Whether the checkbox is checked.',
      control: 'boolean',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    indeterminate: {
      description: 'Whether the checkbox is in an indeterminate (mixed) state. Takes visual precedence over `checked`.',
      control: 'boolean',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    size: {
      description: "Controls the checkbox's visual size.",
      control: 'select',
      options: ['sm', 'md'],
      table: { type: { summary: "'sm' | 'md'" }, defaultValue: { summary: 'sm' } },
    },
    disabled: {
      description: 'Prevents interaction when `true`.',
      control: 'boolean',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    label: {
      description: 'Text label displayed beside the checkbox.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: '' } },
    },
    supportingText: {
      description: 'Secondary descriptive text shown below the label.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: '' } },
    },
  },
};

export default meta;
type Story = StoryObj<IrisCheckboxComponent>;

export const Overview: Story = {
  args: { size: 'sm', disabled: false },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
    disabled: { control: 'boolean' },
    checked: { table: { disable: true } },
    indeterminate: { table: { disable: true } },
    label: { table: { disable: true } },
    supportingText: { table: { disable: true } },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex;flex-direction:column;gap:8px;">
        <iris-checkbox [checked]="false" [size]="size" [disabled]="disabled" label="Unchecked"></iris-checkbox>
        <iris-checkbox [checked]="true" [size]="size" [disabled]="disabled" label="Checked"></iris-checkbox>
        <iris-checkbox [indeterminate]="true" [size]="size" [disabled]="disabled" label="Mixed (indeterminate)"></iris-checkbox>
      </div>
    `,
  }),
};

export const Default: Story = {
  args: {
    checked: false,
    indeterminate: false,
    label: 'Accept terms',
    size: 'sm',
    disabled: false,
    supportingText: '',
  },
};

export const Checked: Story = {
  args: { checked: true, indeterminate: false, label: 'Accept terms', size: 'sm', disabled: false, supportingText: '' },
};

export const Mixed: Story = {
  args: { checked: false, indeterminate: true, label: 'Select all', size: 'sm', disabled: false, supportingText: '' },
};

export const Disabled: Story = {
  args: { checked: true, indeterminate: false, label: 'Disabled', size: 'sm', disabled: true, supportingText: '' },
};

export const Medium: Story = {
  args: { checked: false, indeterminate: false, label: 'Medium size', size: 'md', disabled: false, supportingText: '' },
};

export const WithSupportingText: Story = {
  args: {
    checked: false,
    indeterminate: false,
    label: 'Accept terms',
    size: 'sm',
    disabled: false,
    supportingText: 'You agree to our terms of service.',
  },
};
