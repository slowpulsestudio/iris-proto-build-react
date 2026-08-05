// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { IrisTabsComponent } from '@iris-ui/lib/tabs/tabs.component';
import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta<IrisTabsComponent> = {
  title: 'Navigation/Tabs',
  component: IrisTabsComponent,
  tags: ['preview'],
  argTypes: {
    items: {
      description:
        "Array of `TabItem` objects defining each tab's label, value, optional icon, optional counter, and optional counter type.",
      control: 'object',
      table: {
        type: { summary: 'TabItem[]' },
        defaultValue: { summary: '[]' },
      },
    },
    activeValue: {
      description: 'The `value` of the currently active tab. Supports two-way binding.',
      control: 'text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "''" },
      },
    },
    activeValueChange: {
      description:
        'Emits the new active value on every tab selection. Use `(activeValueChange)` to sync state in the parent.',
      table: { type: { summary: 'string' }, defaultValue: { summary: '—' }, category: 'Events' },
    },
    ariaLabel: {
      description:
        'Accessible label for the `role="tablist"` container, announced by screen readers. Recommended when multiple tablists are on the same page.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: '' }, category: 'Accessibility' },
    },
    activeValueState: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<IrisTabsComponent>;

export const Overview: Story = {
  argTypes: {
    activeValueChange: { table: { disable: true } },
  },
  args: {
    activeValue: 'overview',
    items: [
      { label: 'Overview', value: 'overview' },
      { label: 'Members', value: 'members', counter: 12 },
      { label: 'Settings', value: 'settings', counter: 211, counterType: 'action' },
    ],
  },
};

export const WithActionCounter: Story = {
  argTypes: {
    activeValueChange: { table: { disable: true } },
  },
  args: {
    activeValue: 'alerts',
    items: [
      { label: 'Dashboard', value: 'dashboard', counter: 7, counterType: 'default' },
      { label: 'Alerts', value: 'alerts', counter: 64, counterType: 'action' },
    ],
  },
};

export const WithIcons: Story = {
  argTypes: {
    activeValueChange: { table: { disable: true } },
  },
  args: {
    activeValue: 'users',
    items: [
      { label: 'Users', value: 'users', icon: 'Users' },
      { label: 'Groups', value: 'groups', icon: 'UsersThree', counter: 3 },
      { label: 'Roles', value: 'roles', icon: 'ShieldCheck' },
    ],
  },
};

export const TwoTabs: Story = {
  argTypes: {
    activeValueChange: { table: { disable: true } },
  },
  args: {
    activeValue: 'active',
    items: [
      { label: 'Active', value: 'active' },
      { label: 'Archived', value: 'archived', counter: 3 },
    ],
  },
};
