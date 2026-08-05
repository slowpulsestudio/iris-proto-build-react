// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { IrisPaginationComponent } from '@iris-ui/lib/pagination/pagination.component';
import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta<IrisPaginationComponent> = {
  title: 'Navigation/Pagination',
  component: IrisPaginationComponent,
  tags: ['preview'],
  argTypes: {
    type: {
      description: 'Display mode — numbered pages or simplified Previous/Next labels.',
      control: 'select',
      options: ['default', 'simplified'],
      table: {
        type: { summary: "'default' | 'simplified'" },
        defaultValue: { summary: 'default' },
      },
    },
    totalPages: {
      description: 'Total number of pages available.',
      control: 'number',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '1' },
      },
    },
    currentPage: {
      description: 'The currently active page (1-based).',
      control: 'number',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '1' },
      },
    },
    maxVisiblePages: {
      description: 'Maximum number of page buttons visible between the first and last page in default mode.',
      control: 'number',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '5' },
      },
    },
    pageChange: {
      description: 'Emits  when the user navigates to a different page.',
      table: {
        type: { summary: 'PaginationChangeEvent' },
        defaultValue: { summary: '—' },
        category: 'Events',
      },
    },
    ariaLabel: {
      description:
        'Accessible label for the `<nav>` landmark, announced by screen readers. Localise for non-English UIs.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'Pagination' }, category: 'Accessibility' },
    },
  },
};

export default meta;
type Story = StoryObj<IrisPaginationComponent>;

export const Overview: Story = {
  args: { type: 'default', totalPages: 154, currentPage: 2 },
  argTypes: {
    type: { control: 'select', options: ['default', 'simplified'] },
    totalPages: { control: 'number' },
    currentPage: { control: 'number' },
    maxVisiblePages: { table: { disable: true } },
    pageChange: { table: { disable: true } },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;">
        <iris-pagination [type]="type" [totalPages]="totalPages" [currentPage]="currentPage"></iris-pagination>
      </div>
    `,
  }),
};

export const Default: Story = {
  args: { type: 'default', totalPages: 154, currentPage: 2 },
};

export const Simplified: Story = {
  args: { type: 'simplified', totalPages: 20, currentPage: 5 },
};

export const FirstPage: Story = {
  args: { type: 'default', totalPages: 154, currentPage: 1 },
};

export const MiddlePage: Story = {
  args: { type: 'default', totalPages: 154, currentPage: 95 },
};

export const LastPage: Story = {
  args: { type: 'default', totalPages: 154, currentPage: 154 },
};

export const FewPages: Story = {
  args: { type: 'default', totalPages: 3, currentPage: 2 },
};
