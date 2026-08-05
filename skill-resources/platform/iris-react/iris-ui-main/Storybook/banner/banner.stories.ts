// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { IrisBannerComponent } from '@iris-ui/lib/banner/banner.component';
import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta<IrisBannerComponent> = {
  title: 'Display/Banner',
  component: IrisBannerComponent,
  tags: ['preview'],
  argTypes: {
    type: {
      description: 'Semantic intent of the banner, which determines its icon and color.',
      control: 'select',
      options: ['info', 'warning', 'error', 'success'],
      table: { type: { summary: "'info' | 'warning' | 'error' | 'success'" }, defaultValue: { summary: 'info' } },
    },
    colored: {
      description: 'Applies a tinted background and type-specific border color matching the banner type.',
      control: 'boolean',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    dismissable: {
      description: 'Shows an × button that hides the banner when clicked.',
      control: 'boolean',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
    },
    title: {
      description: 'Bold heading text at the top of the banner.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: '' } },
    },
    supportingText: {
      description: 'Secondary body copy shown below the title.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: '' } },
    },
    showActions: {
      description: 'Renders primary and secondary action buttons when `true`.',
      control: 'boolean',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    primaryActionLabel: {
      description: 'Label for the primary action button. Only shown when `showActions` is `true`.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'View' }, category: 'Actions' },
    },
    secondaryActionLabel: {
      description: 'Label for the secondary action button. Only shown when `showActions` is `true`.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'Dismiss' }, category: 'Actions' },
    },
    dismissed: {
      description: 'Emitted when the user clicks the dismiss (×) button.',
      table: { type: { summary: 'void' }, defaultValue: { summary: '—' }, category: 'Events' },
    },
    primaryActionClick: {
      description: 'Emitted when the primary action button is clicked.',
      table: { type: { summary: 'void' }, defaultValue: { summary: '—' }, category: 'Events' },
    },
    secondaryActionClick: {
      description: 'Emitted when the secondary action button is clicked.',
      table: { type: { summary: 'void' }, defaultValue: { summary: '—' }, category: 'Events' },
    },
    dismissAriaLabel: {
      description:
        'Accessible label for the dismiss (×) button, announced by screen readers. Localise for non-English UIs.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'Dismiss' }, category: 'Accessibility' },
    },
  },
};

export default meta;
type Story = StoryObj<IrisBannerComponent>;

export const Overview: Story = {
  args: {
    colored: false,
    dismissable: true,
    showActions: false,
    title: 'Moonbase Alpha-4',
    supportingText: 'You are currently logged in from Moonbase Alpha-4.',
    primaryActionLabel: 'View',
    secondaryActionLabel: 'Dismiss',
  },
  argTypes: {
    type: { table: { disable: true } },
    dismissed: { table: { disable: true } },
    primaryActionClick: { table: { disable: true } },
    secondaryActionClick: { table: { disable: true } },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <iris-banner type="info"    [colored]="colored" [dismissable]="dismissable" [showActions]="showActions" [title]="title" [supportingText]="supportingText" [primaryActionLabel]="primaryActionLabel" [secondaryActionLabel]="secondaryActionLabel"></iris-banner>
        <iris-banner type="warning" [colored]="colored" [dismissable]="dismissable" [showActions]="showActions" [title]="title" [supportingText]="supportingText" [primaryActionLabel]="primaryActionLabel" [secondaryActionLabel]="secondaryActionLabel"></iris-banner>
        <iris-banner type="error"   [colored]="colored" [dismissable]="dismissable" [showActions]="showActions" [title]="title" [supportingText]="supportingText" [primaryActionLabel]="primaryActionLabel" [secondaryActionLabel]="secondaryActionLabel"></iris-banner>
        <iris-banner type="success" [colored]="colored" [dismissable]="dismissable" [showActions]="showActions" [title]="title" [supportingText]="supportingText" [primaryActionLabel]="primaryActionLabel" [secondaryActionLabel]="secondaryActionLabel"></iris-banner>
      </div>
    `,
  }),
};

export const Default: Story = {
  args: {
    type: 'info',
    title: 'Moonbase Alpha-4',
    supportingText: 'You are currently logged in from Moonbase Alpha-4.',
    dismissable: true,
  },
};

export const Warning: Story = {
  args: {
    type: 'warning',
    colored: true,
    title: 'Safety checks incomplete',
    supportingText: 'Safety checks must be completed before this mission can proceed.',
  },
};

export const Error: Story = {
  args: {
    type: 'error',
    colored: true,
    title: 'Safety checks have failed',
    supportingText: 'An issue has been discovered with your fuel mixture.',
  },
};

export const WithActions: Story = {
  args: {
    type: 'info',
    colored: true,
    title: 'Arrival of crew',
    supportingText: 'Crew-2 astronauts arrive at the space station.',
    showActions: true,
  },
};

export const Success: Story = {
  args: {
    type: 'success',
    colored: true,
    title: 'Mission complete',
    supportingText: 'All objectives have been achieved successfully.',
  },
};
