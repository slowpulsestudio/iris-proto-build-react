// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { IrisToggleComponent } from '@iris-ui/lib/toggle/toggle.component';
import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta<IrisToggleComponent> = {
  title: 'Inputs/Toggle',
  component: IrisToggleComponent,
  tags: ['preview'],
  argTypes: {
    checked: {
      description: 'Whether the toggle is in the on state.',
      control: 'boolean',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    disabled: {
      description: 'Prevents interaction when `true`.',
      control: 'boolean',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    valueChange: {
      description: 'Emitted with the new boolean value whenever the toggle state changes.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: '—' }, category: 'Events' },
    },
  },
};

export default meta;
type Story = StoryObj<IrisToggleComponent>;

export const Overview: Story = {
  args: { disabled: false },
  argTypes: {
    disabled: { control: 'boolean' },
    checked: { table: { disable: true } },
    valueChange: { table: { disable: true } },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex;gap:16px;align-items:center;">
        <iris-toggle [checked]="false" [disabled]="disabled">Notifications</iris-toggle>
        <iris-toggle [checked]="true"  [disabled]="disabled">Notifications</iris-toggle>
      </div>
    `,
  }),
};

export const Off: Story = {
  args: { checked: false },
  render: (args) => ({
    props: args,
    template: `<iris-toggle [checked]="checked" [disabled]="disabled">Enable feature</iris-toggle>`,
  }),
};

export const On: Story = {
  args: { checked: true },
  render: (args) => ({
    props: args,
    template: `<iris-toggle [checked]="checked" [disabled]="disabled">Enable feature</iris-toggle>`,
  }),
};

export const Disabled: Story = {
  args: { checked: false, disabled: true },
  render: (args) => ({
    props: args,
    template: `<iris-toggle [checked]="checked" [disabled]="disabled">Enable feature</iris-toggle>`,
  }),
};

export const DisabledOn: Story = {
  args: { checked: true, disabled: true },
  render: (args) => ({
    props: args,
    template: `<iris-toggle [checked]="checked" [disabled]="disabled">Enable feature</iris-toggle>`,
  }),
};
