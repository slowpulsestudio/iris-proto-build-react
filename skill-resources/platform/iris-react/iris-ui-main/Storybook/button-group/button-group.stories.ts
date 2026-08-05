// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import type { Meta, StoryObj } from '@storybook/angular';
import { IrisButtonGroupComponent } from '@iris-ui/lib/button-group/button-group.component';
import { IrisButtonComponent } from '@iris-ui/lib/button/button.component';

const meta: Meta<IrisButtonGroupComponent> = {
  title: 'Actions/ButtonGroup',
  component: IrisButtonGroupComponent,
  tags: ['preview'],
  argTypes: {
    size: {
      description: 'Controls the size of all buttons within the group.',
      control: 'select',
      options: ['default', 'lg'],
      table: { type: { summary: "'default' | 'lg'" }, defaultValue: { summary: 'default' } },
    },
    direction: {
      description:
        'Controls whether the primary CTA button appears at the end (default) or the start (reverse) of the group.',
      control: 'select',
      options: ['default', 'reverse'],
      table: { type: { summary: "'default' | 'reverse'" }, defaultValue: { summary: 'default' } },
    },
    ariaLabel: {
      description:
        'Accessible label for the button group (`role="group"`). Recommended for screen readers when the visual context does not sufficiently describe the group purpose.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: '' }, category: 'Accessibility' },
    },
  },
};

export default meta;
type Story = StoryObj<IrisButtonGroupComponent>;

export const Overview: Story = {
  args: { size: 'default', direction: 'default' },
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: [IrisButtonComponent] },
    template: `
      <iris-button-group [size]="size" [direction]="direction">
        <iris-button variant="primary">Save</iris-button>
        <iris-button variant="secondary">Cancel</iris-button>
        <iris-button variant="ghost">Reset</iris-button>
      </iris-button-group>
    `,
  }),
};

export const Default: Story = {
  args: { size: 'default', direction: 'default' },
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: [IrisButtonComponent] },
    template: `
      <iris-button-group [size]="size" [direction]="direction">
        <iris-button variant="primary">Save</iris-button>
        <iris-button variant="secondary">Cancel</iris-button>
        <iris-button variant="ghost">Reset</iris-button>
      </iris-button-group>
    `,
  }),
};

export const Large: Story = {
  args: { size: 'lg', direction: 'default' },
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: [IrisButtonComponent] },
    template: `
      <iris-button-group [size]="size" [direction]="direction">
        <iris-button variant="primary">Save</iris-button>
        <iris-button variant="secondary">Cancel</iris-button>
        <iris-button variant="ghost">Reset</iris-button>
      </iris-button-group>
    `,
  }),
};

export const Reverse: Story = {
  args: { size: 'default', direction: 'reverse' },
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: [IrisButtonComponent] },
    template: `
      <iris-button-group [size]="size" [direction]="direction">
        <iris-button variant="primary">Save</iris-button>
        <iris-button variant="secondary">Cancel</iris-button>
        <iris-button variant="ghost">Reset</iris-button>
      </iris-button-group>
    `,
  }),
};
