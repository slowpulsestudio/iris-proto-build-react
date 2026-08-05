// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { IrisFormFieldComponent } from '@iris-ui/lib/form-field/form-field.component';
import { IrisLabelComponent } from '@iris-ui/lib/label/label.component';
import { IrisSubtextComponent } from '@iris-ui/lib/subtext/subtext.component';
import { IrisTextInputComponent } from '@iris-ui/lib/textinput/textinput.component';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<IrisFormFieldComponent> = {
  title: 'Inputs/FormField',
  component: IrisFormFieldComponent,
  tags: ['preview'],
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule, IrisLabelComponent, IrisTextInputComponent, IrisSubtextComponent],
    }),
  ],
};

export default meta;
type Story = StoryObj<IrisFormFieldComponent>;

export const Overview: Story = {
  render: () => ({
    template: `
      <iris-form-field>
        <iris-label>Email address</iris-label>
        <iris-textinput placeholder="you@example.com"></iris-textinput>
        <iris-subtext type="hint">We'll never share your email with anyone.</iris-subtext>
      </iris-form-field>
    `,
  }),
};

export const LabelWithInfoText: Story = {
  name: 'Label with info text',
  render: () => ({
    template: `
      <div style="display:grid;grid-template-columns:1fr;gap:1rem;max-width:28rem;">
        <iris-form-field>
          <iris-label infoText="We use your work email for account notifications and security verification." infoTooltipPosition="top">
            Email address
          </iris-label>
          <iris-textinput placeholder="you@example.com"></iris-textinput>
          <iris-subtext type="hint">Hover or focus the info icon next to the label.</iris-subtext>
        </iris-form-field>

        <iris-form-field>
          <iris-label
            infoText="Password must be at least 12 characters and include uppercase, lowercase, number, and special character."
            infoTooltipPosition="right">
            Password
          </iris-label>
          <iris-textinput type="password" placeholder="Enter password"></iris-textinput>
          <iris-subtext type="hint">This example uses a longer tooltip message with right placement.</iris-subtext>
        </iris-form-field>
      </div>
    `,
  }),
};

export const WithValidation: Story = {
  name: 'Validation — required + email',
  render: () => ({
    props: {
      control: (() => {
        const formControl = new FormControl('not an email, shows error', [Validators.required, Validators.email]);
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
        @if (control.hasError('email')) {
          <iris-subtext type="error">Enter a valid email address.</iris-subtext>
        }
      </iris-form-field>
    `,
  }),
};

export const AutoRequiredLabel: Story = {
  name: 'Auto required label',
  render: () => ({
    props: {
      control: new FormControl('', [Validators.required]),
    },
    template: `
      <iris-form-field>
        <iris-label>Full name</iris-label>
        <iris-textinput [formControl]="control" placeholder="Enter your name"></iris-textinput>
        <iris-subtext type="hint">The (Required) indicator is derived automatically from the form control.</iris-subtext>
      </iris-form-field>
    `,
  }),
};

export const NoSubtext: Story = {
  name: 'No subtext',
  render: () => ({
    template: `
      <iris-form-field>
        <iris-label>Search</iris-label>
        <iris-textinput placeholder="Search..." leadingIcon="MagnifyingGlass"></iris-textinput>
      </iris-form-field>
    `,
  }),
};

export const LargeSize: Story = {
  name: 'Large size',
  render: () => ({
    template: `
      <iris-form-field>
        <iris-label>Search</iris-label>
        <iris-textinput placeholder="Search..." leadingIcon="MagnifyingGlass" size="lg"></iris-textinput>
      </iris-form-field>
    `,
  }),
};
