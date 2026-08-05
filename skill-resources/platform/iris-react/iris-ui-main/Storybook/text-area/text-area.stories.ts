// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { IrisFormFieldComponent } from '@iris-ui/lib/form-field/form-field.component';
import { IrisLabelComponent } from '@iris-ui/lib/label/label.component';
import { IrisSubtextComponent } from '@iris-ui/lib/subtext/subtext.component';
import { IrisTextAreaComponent } from '@iris-ui/lib/text-area/text-area.component';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<IrisTextAreaComponent> = {
  title: 'Inputs/TextArea',
  component: IrisTextAreaComponent,
  tags: ['preview'],
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule, IrisFormFieldComponent, IrisLabelComponent, IrisSubtextComponent],
    }),
  ],
  argTypes: {
    placeholder: {
      description: 'Placeholder text shown when the textarea is empty.',
      control: 'text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
    },
    value: {
      description: 'Current value of the textarea.',
      control: 'text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
    },
    disabled: {
      description: 'Prevents interaction when true.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    readonly: {
      description: 'Makes the textarea read-only; the value can be copied but not edited.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    valueChange: {
      table: { disable: true },
    },
    rows: {
      description: 'Visible text lines.',
      control: { type: 'number', min: 1 },
      table: { type: { summary: 'number | null' }, defaultValue: { summary: 'null' } },
    },
    resize: {
      description: 'Textarea resize behavior.',
      control: 'select',
      options: ['none', 'both', 'horizontal', 'vertical'],
      table: {
        type: { summary: `'none' | 'both' | 'horizontal' | 'vertical'` },
        defaultValue: { summary: `'vertical'` },
      },
    },
  },
};

export default meta;
type Story = StoryObj<IrisTextAreaComponent>;

export const Overview: Story = {
  args: {
    disabled: false,
    readonly: false,
    placeholder: '',
    rows: null,
    resize: 'vertical',
  },
  argTypes: {
    value: { table: { disable: true } },
    valueChange: { table: { disable: true } },
  },
  render: (args) => ({
    props: args,
    template: `
      <iris-form-field>
        <iris-label>Description</iris-label>
        <iris-text-area
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [rows]="rows"
          [resize]="resize">
        </iris-text-area>
        <iris-subtext type="hint">Describe your request in detail.</iris-subtext>
      </iris-form-field>
    `,
  }),
};

export const Default: Story = {
  render: () => ({
    template: `
      <iris-form-field>
        <iris-label>Description</iris-label>
        <iris-text-area placeholder="Enter a description"></iris-text-area>
      </iris-form-field>
    `,
  }),
};

export const Disabled: Story = {
  render: () => ({
    template: `
      <iris-form-field>
        <iris-label>Description</iris-label>
        <iris-text-area
        placeholder="Enter a description" [disabled]="true"></iris-text-area>
      </iris-form-field>
    `,
  }),
};

export const Readonly: Story = {
  render: () => ({
    template: `
      <iris-form-field>
        <iris-label>Summary</iris-label>
        <iris-text-area value="This is a readonly summary that cannot be edited." [readonly]="true"></iris-text-area>
      </iris-form-field>
    `,
  }),
};

export const WithHint: Story = {
  render: () => ({
    template: `
      <iris-form-field>
        <iris-label>Notes</iris-label>
        <iris-text-area placeholder="Add any relevant notes"></iris-text-area>
        <iris-subtext type="hint">This information will only be visible to administrators.</iris-subtext>
      </iris-form-field>
    `,
  }),
};

export const WithValidationError: Story = {
  render: () => ({
    props: (() => {
      const control = new FormControl('', [Validators.required]);
      control.markAsTouched();
      return { control };
    })(),
    template: `
      <iris-form-field>
        <iris-label>Description</iris-label>
        <iris-text-area [formControl]="control" placeholder="Enter a description"></iris-text-area>
        <iris-subtext type="hint">Please describe the issue in detail.</iris-subtext>
        @if (control.hasError('required')) {
          <iris-subtext type="error">Description is required.</iris-subtext>
        }
      </iris-form-field>
    `,
  }),
};

export const WithCharacterCount: Story = {
  render: () => ({
    props: (() => {
      const control = new FormControl('', [Validators.maxLength(200)]);
      return { control };
    })(),
    template: `
      <iris-form-field>
        <iris-label>Bio</iris-label>
        <iris-text-area [formControl]="control" placeholder="Tell us about yourself"></iris-text-area>
        <iris-subtext type="hint">Keep it short and sweet.</iris-subtext>
      </iris-form-field>
    `,
  }),
};
