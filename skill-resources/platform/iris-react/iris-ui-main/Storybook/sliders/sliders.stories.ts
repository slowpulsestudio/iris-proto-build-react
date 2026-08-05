// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { IrisSlidersComponent } from '@iris-ui/lib/sliders/sliders.component';
import type { Meta, StoryObj } from '@storybook/angular';

const SINGLE_ONLY_ARGS = {
  dualThumb: { table: { disable: true } },
  valueLow: { table: { disable: true } },
  valueHigh: { table: { disable: true } },
  valueChange: { table: { disable: true } },
  valueLowChange: { table: { disable: true } },
  valueHighChange: { table: { disable: true } },
};

const DUAL_ONLY_ARGS = {
  dualThumb: { table: { disable: true } },
  value: { table: { disable: true } },
  valueChange: { table: { disable: true } },
  valueLowChange: { table: { disable: true } },
  valueHighChange: { table: { disable: true } },
};

const meta: Meta<IrisSlidersComponent> = {
  title: 'Inputs/Sliders',
  component: IrisSlidersComponent,
  tags: ['preview'],
  argTypes: {
    min: {
      control: 'number',
      description: 'Minimum selectable value.',
      table: { type: { summary: 'number' }, defaultValue: { summary: '0' } },
    },
    max: {
      control: 'number',
      description: 'Maximum selectable value.',
      table: { type: { summary: 'number' }, defaultValue: { summary: '100' } },
    },
    step: {
      control: 'number',
      description: 'Increment between selectable values.',
      table: { type: { summary: 'number' }, defaultValue: { summary: '1' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables interaction and applies disabled styling.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    dualThumb: {
      control: 'boolean',
      description: 'Switches to dual-thumb range mode with `valueLow` and `valueHigh`.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    label: {
      control: 'select',
      options: ['none', 'tooltip', 'bottom'],
      description: 'Controls how the current value is displayed alongside the thumb.',
      table: { type: { summary: "'none' | 'tooltip' | 'bottom'" }, defaultValue: { summary: "'tooltip'" } },
    },
    value: {
      control: 'number',
      description: 'Only applicable in single-thumb mode.',
      table: { type: { summary: 'number' }, defaultValue: { summary: '0' }, category: 'Single thumb' },
    },
    valueLow: {
      control: 'number',
      description: 'Only applicable in dual-thumb mode.',
      table: { type: { summary: 'number' }, defaultValue: { summary: '0' }, category: 'Dual thumb' },
    },
    valueHigh: {
      control: 'number',
      description: 'Only applicable in dual-thumb mode.',
      table: { type: { summary: 'number' }, defaultValue: { summary: '100' }, category: 'Dual thumb' },
    },
    valueChange: {
      description: 'Emits the new single-thumb value on every change.',
      table: { type: { summary: 'number' }, defaultValue: { summary: '—' }, category: 'Events' },
    },
    valueLowChange: {
      description: 'Emits the new low-thumb value on every change (dual-thumb mode).',
      table: { type: { summary: 'number' }, defaultValue: { summary: '—' }, category: 'Events' },
    },
    valueHighChange: {
      description: 'Emits the new high-thumb value on every change (dual-thumb mode).',
      table: { type: { summary: 'number' }, defaultValue: { summary: '—' }, category: 'Events' },
    },
    minimumValueAriaLabel: {
      description:
        'Accessible label for the minimum-value (low) thumb, announced by screen readers in dual-thumb mode. Localise for non-English UIs.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'Minimum value' }, category: 'Accessibility' },
    },
    maximumValueAriaLabel: {
      description:
        'Accessible label for the maximum-value (high) thumb, announced by screen readers in dual-thumb mode. Localise for non-English UIs.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'Maximum value' }, category: 'Accessibility' },
    },
    valueState: { table: { disable: true } },
    valueLowState: { table: { disable: true } },
    valueHighState: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<IrisSlidersComponent>;

export const SingleOverview: Story = {
  args: { min: 0, max: 100, value: 50, step: 1, disabled: false, label: 'tooltip' },
  argTypes: { ...SINGLE_ONLY_ARGS },
};

export const DualOverview: Story = {
  args: { min: 0, max: 100, valueLow: 25, valueHigh: 75, step: 1, disabled: false, label: 'tooltip', dualThumb: true },
  argTypes: { ...DUAL_ONLY_ARGS },
};

export const Default: Story = {
  args: { min: 0, max: 100, value: 50, step: 1 },
  argTypes: { ...SINGLE_ONLY_ARGS },
};

export const Disabled: Story = {
  args: { min: 0, max: 100, value: 30, step: 1, disabled: true },
  argTypes: { ...SINGLE_ONLY_ARGS },
};

export const BottomLabel: Story = {
  args: { min: 0, max: 100, value: 50, step: 1, label: 'bottom' },
  argTypes: { ...SINGLE_ONLY_ARGS },
};

export const DualThumbBottomLabel: Story = {
  args: { min: 0, max: 100, valueLow: 25, valueHigh: 75, step: 1, disabled: false, dualThumb: true, label: 'bottom' },
  argTypes: { ...DUAL_ONLY_ARGS },
};

export const DualThumb: Story = {
  args: { min: 0, max: 100, valueLow: 25, valueHigh: 75, step: 1, label: 'tooltip', disabled: false, dualThumb: true },
  argTypes: { ...DUAL_ONLY_ARGS },
};

export const DualThumbDisabled: Story = {
  args: { min: 0, max: 100, valueLow: 25, valueHigh: 75, step: 1, label: 'tooltip', dualThumb: true, disabled: true },
  argTypes: { ...DUAL_ONLY_ARGS },
};
