// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { IrisKeyboardKeyComponent } from '@iris-ui/lib/keyboard-key/keyboard-key.component';
import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta<IrisKeyboardKeyComponent> = {
  title: 'Display/KeyboardKey',
  component: IrisKeyboardKeyComponent,
  tags: ['preview'],
  argTypes: {
    key: {
      description:
        "The key label, or an array of labels for a shortcut combination (e.g. `['Ctrl', 'Alt', 'T']`). Single-character labels are uppercased; longer labels are sentence-cased.",
      control: 'object',
      table: { type: { summary: 'string | string[]' }, defaultValue: { summary: "''" } },
    },
    type: {
      description: "Visual style of the key; currently only `'default'` is supported.",
      control: 'select',
      options: ['default'],
      table: { type: { summary: "'default'" }, defaultValue: { summary: 'default' } },
    },
  },
};

export default meta;
type Story = StoryObj<IrisKeyboardKeyComponent>;

export const Overview: Story = {
  args: { key: 'Ctrl' },
  argTypes: {
    type: { table: { disable: true } },
  },
  render: (args) => ({
    props: args,
    template: `
      <p style="display:flex;gap:2rem;">
        <span>Simple:</span>
        <iris-keyboard-key [key]="key"></iris-keyboard-key>
        <iris-keyboard-key key="Alt"></iris-keyboard-key>
        <iris-keyboard-key key="Shift"></iris-keyboard-key>
        <iris-keyboard-key key="Enter"></iris-keyboard-key>
        <iris-keyboard-key key="Space"></iris-keyboard-key>
        <iris-keyboard-key key="↑"></iris-keyboard-key>
        <iris-keyboard-key key="→"></iris-keyboard-key>
        <iris-keyboard-key key="A"></iris-keyboard-key>
        <iris-keyboard-key key="B"></iris-keyboard-key>
        <iris-keyboard-key key="C"></iris-keyboard-key>
        <iris-keyboard-key key="D"></iris-keyboard-key>
      </p>
      <p style="display:flex;gap:2rem;">
        <span>Combination:</span>
        <iris-keyboard-key [key]="['Ctrl', 'A']"></iris-keyboard-key>
        <iris-keyboard-key [key]="['Ctrl', 'Alt', 'A']"></iris-keyboard-key>
        <iris-keyboard-key [key]="['SHIFT', 'W']"></iris-keyboard-key>
      </p>
    `,
  }),
};

export const Default: Story = {
  args: { key: 'Ctrl' },
};

export const Combination: Story = {
  args: { key: ['Ctrl', 'Alt', 'T'] },
  argTypes: {
    type: { table: { disable: true } },
  },
};

export const Enter: Story = {
  args: { key: 'Enter' },
};

export const Escape: Story = {
  args: { key: 'Esc' },
};
