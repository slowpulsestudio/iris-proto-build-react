// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { IrisRadioButtonComponent } from '@iris-ui/lib/radio-buttons/radio-button.component';
import { IrisRadioGroupComponent } from '@iris-ui/lib/radio-buttons/radio-group.component';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<IrisRadioButtonComponent> = {
  title: 'Inputs/RadioButton',
  component: IrisRadioButtonComponent,
  tags: ['!dev', '!autodocs'],
  argTypes: {
    value: {
      description: 'Unique value identifying this button within the group. Required.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: '' } },
    },
    disabled: {
      description: 'Disables this individual button regardless of the group `disabled` state.',
      control: 'boolean',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    supportingText: {
      description: 'Optional secondary line of text displayed below the label.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: '' } },
    },
  },
  decorators: [moduleMetadata({ imports: [IrisRadioGroupComponent] })],
};

export default meta;
type Story = StoryObj<IrisRadioButtonComponent>;

export const ButtonPreview: Story = {
  args: { value: 'option', disabled: false, supportingText: '' },
  render: (args) => ({
    props: args,
    template: `
      <iris-radio-group value="option">
        <iris-radio-button [value]="value" [disabled]="disabled" [supportingText]="supportingText">
          Label
        </iris-radio-button>
      </iris-radio-group>
    `,
  }),
};
