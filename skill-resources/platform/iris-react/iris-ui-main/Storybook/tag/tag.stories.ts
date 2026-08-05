// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { IrisTagComponent } from '@iris-ui/lib/tag/tag.component';
import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta<IrisTagComponent> = {
  title: 'Display/Tag',
  component: IrisTagComponent,
  tags: ['preview'],
  argTypes: {
    text: {
      description: 'The label text displayed inside the tag.',
      control: 'text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
    },
    removable: {
      description: 'When `true`, displays a remove button that emits the `remove` event on click.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    removed: {
      description: 'Emitted when the user clicks or presses the remove button.',
      table: {
        type: { summary: 'void' },
        defaultValue: { summary: '—' },
        category: 'Events',
      },
    },
    removeAriaLabel: {
      description:
        'Accessible label for the remove (×) button, announced by screen readers. Localise for non-English UIs.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'Remove' }, category: 'Accessibility' },
    },
  },
};

export default meta;
type Story = StoryObj<IrisTagComponent>;

export const Overview: Story = {
  args: { removable: true },
  argTypes: {
    removable: { control: 'boolean' },
    text: { table: { disable: true } },
    removed: { table: { disable: true } },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex;gap:8px;align-items:center;">
        <iris-tag text="Design" [removable]="removable"></iris-tag>
        <iris-tag text="Development" [removable]="removable"></iris-tag>
        <iris-tag text="QA" [removable]="removable"></iris-tag>
      </div>
    `,
  }),
};

export const Default: Story = {
  args: { text: 'Tag', removable: true },
};

export const NotRemovable: Story = {
  args: { text: 'Read only', removable: false },
};
