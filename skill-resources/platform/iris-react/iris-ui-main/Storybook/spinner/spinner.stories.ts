// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { IrisSpinnerComponent } from '@iris-ui/lib/spinner/spinner.component';
import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta<IrisSpinnerComponent> = {
  title: 'Display/Spinner',
  component: IrisSpinnerComponent,
  tags: ['preview'],
  argTypes: {
    size: {
      description: 'Visual size of the spinner.',
      control: 'select',
      options: ['sm', 'default', 'lg'],
      table: {
        type: { summary: "'sm' | 'default' | 'lg'" },
        defaultValue: { summary: 'default' },
      },
    },
    scenario: {
      description:
        'Loop spins indefinitely when progress is unknown; Completion shows a static arc for a known progress value.',
      control: 'select',
      options: ['loop', 'completion'],
      table: {
        type: { summary: "'loop' | 'completion'" },
        defaultValue: { summary: 'loop' },
      },
    },
    progress: {
      description: 'Progress value from 0 to 100. Only used when scenario is `completion`.',
      control: { type: 'range', min: 0, max: 100, step: 1 },
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '0' },
        category: 'Completion',
      },
    },
    ariaLabel: {
      description:
        'Accessible label announced by screen readers while the spinner is visible. Localise for non-English UIs.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'Loading' }, category: 'Accessibility' },
    },
  },
};

export default meta;
type Story = StoryObj<IrisSpinnerComponent>;

export const Overview: Story = {
  args: { size: 'default', scenario: 'loop', progress: 0 },
  argTypes: {
    size: { table: { disable: true } },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex;gap:24px;align-items:center;">
        <iris-spinner size="sm"      [scenario]="scenario" [progress]="progress"></iris-spinner>
        <iris-spinner size="default" [scenario]="scenario" [progress]="progress"></iris-spinner>
        <iris-spinner size="lg"      [scenario]="scenario" [progress]="progress"></iris-spinner>
      </div>
    `,
  }),
};

export const Loop: Story = {
  args: { size: 'default', scenario: 'loop', progress: 0 },
};

export const Completion: Story = {
  args: { size: 'lg', scenario: 'completion', progress: 65 },
};

export const Small: Story = {
  args: { size: 'sm', scenario: 'loop', progress: 0 },
};

export const Large: Story = {
  args: { size: 'lg', scenario: 'loop', progress: 0 },
};
