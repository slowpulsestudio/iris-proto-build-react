// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { IrisButtonComponent } from '@iris-ui/lib/button/button.component';
import { IrisTooltipDirective } from '@iris-ui/lib/tooltip/tooltip.directive';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<IrisTooltipDirective> = {
  title: 'Overlay/Tooltip',
  component: IrisTooltipDirective,
  tags: ['preview'],
  decorators: [moduleMetadata({ imports: [IrisTooltipDirective, IrisButtonComponent] })],
  argTypes: {
    irisTooltip: {
      description: 'Text displayed inside the tooltip.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: '' } },
    },
    irisTooltipShortcut: {
      description:
        'Keyboard shortcut rendered beside the tooltip text. Pass an array of key labels — multiple keys are displayed as a non-breaking combination.',
      control: 'object',
      table: { type: { summary: 'string[]' }, defaultValue: { summary: '[]' } },
    },
    irisTooltipPosition: {
      description: 'Which side of the trigger element the tooltip appears on.',
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      table: { type: { summary: "'top' | 'bottom' | 'left' | 'right'" }, defaultValue: { summary: 'top' } },
    },
    irisTooltipDisabled: {
      description: 'When true, the tooltip will not appear on hover or focus.',
      control: 'boolean',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
  },
};

export default meta;
type Story = StoryObj<IrisTooltipDirective>;

export const Overview: Story = {
  args: {
    irisTooltip: 'Tooltip text',
    irisTooltipShortcut: [],
    irisTooltipDisabled: false,
  },
  argTypes: {
    irisTooltipPosition: { table: { disable: true } },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;grid-template-rows:1fr;gap:8rem;padding:2rem;width:fit-content;margin: auto">
        <div style="display:flex;justify-content:center;">
          <iris-button
            [irisTooltip]="irisTooltip"
            [irisTooltipShortcut]="irisTooltipShortcut"
            [irisTooltipDisabled]="irisTooltipDisabled"
            irisTooltipPosition="top">
            Top
          </iris-button>
        </div>
        <div style="display:flex;justify-content:center;">
          <iris-button
            [irisTooltip]="irisTooltip"
            [irisTooltipShortcut]="irisTooltipShortcut"
            [irisTooltipDisabled]="irisTooltipDisabled"
            irisTooltipPosition="bottom">
            Bottom
          </iris-button>
        </div>
        <div style="display:flex;justify-content:center;">
          <iris-button
            [irisTooltip]="irisTooltip"
            [irisTooltipShortcut]="irisTooltipShortcut"
            [irisTooltipDisabled]="irisTooltipDisabled"
            irisTooltipPosition="left">
            Left
         </iris-button>
        </div>
        <div style="display:flex;justify-content:center;">
          <iris-button
            [irisTooltip]="irisTooltip"
            [irisTooltipShortcut]="irisTooltipShortcut"
            [irisTooltipDisabled]="irisTooltipDisabled"
            irisTooltipPosition="right">
            Right
          </iris-button>
        </div>
      </div>
    `,
  }),
};

export const WithShortcut: Story = {
  args: {
    irisTooltip: 'Save',
    irisTooltipShortcut: ['⌘', 'S'],
    irisTooltipPosition: 'top',
    irisTooltipDisabled: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="padding:2rem;">
        <iris-button
          [irisTooltip]="irisTooltip"
          [irisTooltipShortcut]="irisTooltipShortcut"
          [irisTooltipPosition]="irisTooltipPosition"
          [irisTooltipDisabled]="irisTooltipDisabled">
          Save
        </iris-button>
      </div>
    `,
  }),
};

export const Disabled: Story = {
  args: {
    irisTooltip: 'This tooltip will not appear',
    irisTooltipShortcut: [],
    irisTooltipPosition: 'top',
    irisTooltipDisabled: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="padding:2rem;">
        <iris-button
          [irisTooltip]="irisTooltip"
          [irisTooltipShortcut]="irisTooltipShortcut"
          [irisTooltipPosition]="irisTooltipPosition"
          [irisTooltipDisabled]="irisTooltipDisabled">
          Tooltip disabled
        </iris-button>
      </div>
    `,
  }),
};
