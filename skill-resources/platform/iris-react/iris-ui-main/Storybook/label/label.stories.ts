// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { IrisFormFieldComponent } from '@iris-ui/lib/form-field/form-field.component';
import { IrisLabelComponent } from '@iris-ui/lib/label/label.component';
import { IrisSubtextComponent } from '@iris-ui/lib/subtext/subtext.component';
import { IrisTextInputComponent } from '@iris-ui/lib/textinput/textinput.component';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<IrisLabelComponent> = {
  title: 'Inputs/Label',
  component: IrisLabelComponent,
  tags: ['preview'],
  argTypes: {
    type: {
      description: 'Visual type of the label.',
      control: 'select',
      options: ['default'],
      table: {
        type: { summary: "'default'" },
        defaultValue: { summary: 'default' },
      },
    },
    requiredText: {
      description: 'Text shown in the required marker. Override for localisation.',
      control: 'text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '(Required)' },
      },
    },
    infoText: {
      description:
        'Tooltip text shown on hover of the info icon. When non-empty, the info icon is shown automatically.',
      control: 'text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
    },
    infoTooltipPosition: {
      description: 'Preferred opening position for the label info tooltip.',
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      table: {
        type: { summary: "'top' | 'bottom' | 'left' | 'right'" },
        defaultValue: { summary: 'top' },
      },
    },
    countValue: {
      description: 'Current character count, provided by the parent form field.',
      control: 'number',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '0' },
      },
    },
    countMax: {
      description:
        'Maximum character limit. When greater than zero, shows the character count indicator automatically.',
      control: 'number',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '0' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<IrisLabelComponent>;

export const Overview: Story = {
  args: { infoText: 'Sample info text', infoTooltipPosition: 'top', countValue: 0, countMax: 0 },
  argTypes: {
    type: { table: { disable: true } },
    requiredText: { table: { disable: true } },
  },
  render: (args) => ({
    props: args,
    template: `
      <iris-label [requiredText]="requiredText" [infoText]="infoText" [infoTooltipPosition]="infoTooltipPosition" [countValue]="countValue" [countMax]="countMax">Label</iris-label>
    `,
  }),
};

export const Default: Story = {
  render: () => ({
    template: `<iris-label>Username</iris-label>`,
  }),
};

export const Required: Story = {
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule, IrisFormFieldComponent, IrisTextInputComponent, IrisSubtextComponent],
    }),
  ],
  render: () => ({
    props: {
      control: new FormControl('', [Validators.required]),
    },
    template: `
      <iris-form-field>
        <iris-label>Username</iris-label>
        <iris-textinput [formControl]="control" placeholder="Enter your username"></iris-textinput>
        <iris-subtext type="hint">The (Required) marker is derived automatically from the form control validator.</iris-subtext>
        <iris-subtext type="error">The (Required) marker is derived automatically from the form control validator.</iris-subtext>
      </iris-form-field>
    `,
  }),
};

export const WithInfoIcon: Story = {
  args: { infoText: 'Must be at least 8 characters and include a number.', infoTooltipPosition: 'right' },
  render: (args) => ({
    props: args,
    template: `<iris-label [infoText]="infoText" [infoTooltipPosition]="infoTooltipPosition">Password</iris-label>`,
  }),
};

export const WithCount: Story = {
  args: { countValue: 24, countMax: 100 },
  render: (args) => ({
    props: args,
    template: `<iris-label [countValue]="countValue" [countMax]="countMax">Description</iris-label>`,
  }),
};
