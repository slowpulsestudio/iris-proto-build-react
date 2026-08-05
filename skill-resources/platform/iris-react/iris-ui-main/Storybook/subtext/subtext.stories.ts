// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { IrisFormFieldComponent } from '@iris-ui/lib/form-field/form-field.component';
import { IrisLabelComponent } from '@iris-ui/lib/label/label.component';
import { IrisSubtextComponent } from '@iris-ui/lib/subtext/subtext.component';
import { IrisTextInputComponent } from '@iris-ui/lib/textinput/textinput.component';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<IrisSubtextComponent> = {
  title: 'Inputs/Subtext',
  component: IrisSubtextComponent,
  tags: ['preview'],
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule, IrisFormFieldComponent, IrisLabelComponent, IrisTextInputComponent],
    }),
  ],
  argTypes: {
    type: {
      description:
        'Controls display style. `hint` renders as muted helper text. `error` renders in error style. When used inside `iris-form-field`, the field shows only one subtext at a time — the first hint when valid, the first error when invalid and touched.',
      control: 'select',
      options: ['hint', 'error'],
      table: {
        type: { summary: "'hint' | 'error'" },
        defaultValue: { summary: '—' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<IrisSubtextComponent>;

export const HintStyle: Story = {
  name: 'Hint style',
  render: () => ({
    template: `
      <iris-form-field>
        <iris-label>Username</iris-label>
        <iris-textinput placeholder="Choose a username"></iris-textinput>
        <iris-subtext type="hint">Must be at least 6 characters.</iris-subtext>
      </iris-form-field>
    `,
  }),
};

export const ErrorStyle: Story = {
  name: 'Error style (forced)',
  render: () => ({
    template: `
      <iris-form-field>
        <iris-label>Username</iris-label>
        <iris-textinput placeholder="Choose a username"></iris-textinput>
        <iris-subtext type="error">Username is already taken.</iris-subtext>
      </iris-form-field>
    `,
  }),
};

export const MultipleErrors: Story = {
  name: 'Multiple errors — first shown',
  render: () => ({
    props: {
      control: (() => {
        const formControl = new FormControl('ab', [Validators.required, Validators.minLength(6), Validators.email]);
        formControl.markAsTouched();
        return formControl;
      })(),
    },
    template: `
      <iris-form-field>
        <iris-label>Email</iris-label>
        <iris-textinput [formControl]="control" placeholder="you@example.com"></iris-textinput>
        <iris-subtext type="hint">Enter your work email address.</iris-subtext>
        @if (control.hasError('required')) {
          <iris-subtext type="error">Email is required.</iris-subtext>
        }
        @if (control.hasError('minlength')) {
          <iris-subtext type="error">Email must be at least 6 characters.</iris-subtext>
        }
        @if (control.hasError('email')) {
          <iris-subtext type="error">Enter a valid email address.</iris-subtext>
        }
      </iris-form-field>
    `,
  }),
};

export const Standalone: Story = {
  name: 'Standalone (no form field)',
  render: () => ({
    template: `
      <div>
        <iris-subtext type="hint">A hint with no parent form field.</iris-subtext>
      </div>
    `,
  }),
};
