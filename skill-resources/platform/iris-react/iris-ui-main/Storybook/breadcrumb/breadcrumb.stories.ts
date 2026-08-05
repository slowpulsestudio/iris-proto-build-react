// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { IrisBreadcrumbComponent } from '@iris-ui/lib/breadcrumb/breadcrumb.component';
import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta<IrisBreadcrumbComponent> = {
  title: 'Navigation/Breadcrumb',
  component: IrisBreadcrumbComponent,
  tags: ['preview'],
  argTypes: {
    items: {
      description: 'Ordered array of `BreadcrumbItem` objects defining the navigation path.',
      control: 'object',
      table: { type: { summary: 'BreadcrumbItem[]' }, defaultValue: { summary: '[]' } },
    },
    currentPageClickable: {
      description:
        'When `true`, the last item renders as a link if it has an `href`. When `false` (default), the last item always renders as plain text with `aria-current="page"`.',
      control: 'boolean',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    maxVisibleItems: {
      description:
        'Maximum number of breadcrumb items to show before collapsing middle items into an overflow menu. Set to `0` to disable overflow.',
      control: 'number',
      table: { type: { summary: 'number' }, defaultValue: { summary: '0' } },
    },
    ariaLabel: {
      description:
        'Accessible label for the `<nav>` landmark, announced by screen readers. Localise for non-English UIs.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: "'Breadcrumb'" }, category: 'Accessibility' },
    },
    overflowItemSelected: {
      description: 'Emitted when the user selects a hidden item from the overflow dropdown.',
      table: { type: { summary: 'BreadcrumbOverflowEvent' }, defaultValue: { summary: '—' }, category: 'Events' },
    },
  },
};

export default meta;
type Story = StoryObj<IrisBreadcrumbComponent>;

export const Default: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Missions', href: '/missions' },
      { label: 'Apollo', href: '/missions/apollo' },
      { label: 'Apollo 11' },
    ],
  },
};

export const Interactive: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Missions', href: '/missions' },
      { label: 'Apollo', href: '/missions/apollo' },
      { label: 'Apollo 11' },
    ],
    currentPageClickable: false,
  },
};

export const Overflow: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Organization', href: '/org' },
      { label: 'Division', href: '/org/division' },
      { label: 'Department', href: '/org/division/dept' },
      { label: 'Team', href: '/org/division/dept/team' },
      { label: 'Project' },
    ],
    maxVisibleItems: 3,
  },
};
