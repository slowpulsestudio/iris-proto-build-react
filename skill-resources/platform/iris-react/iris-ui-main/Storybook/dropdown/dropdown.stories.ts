// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { IrisDropdownComponent } from '@iris-ui/lib/dropdown/dropdown.component';
import { IrisFormFieldComponent } from '@iris-ui/lib/form-field/form-field.component';
import { IrisLabelComponent } from '@iris-ui/lib/label/label.component';
import { IrisSubtextComponent } from '@iris-ui/lib/subtext/subtext.component';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const sampleOptions = [
  { type: 'item' as const, label: 'United States', value: 'us' },
  { type: 'item' as const, label: 'Canada', value: 'ca' },
  { type: 'item' as const, label: 'United Kingdom', value: 'uk' },
  { type: 'item' as const, label: 'Germany', value: 'de' },
  { type: 'item' as const, label: 'France', value: 'fr' },
];

const meta: Meta<IrisDropdownComponent> = {
  title: 'Inputs/Dropdown',
  component: IrisDropdownComponent,
  tags: ['preview'],
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule, IrisFormFieldComponent, IrisLabelComponent, IrisSubtextComponent],
    }),
  ],
  argTypes: {
    placeholder: {
      description: 'Placeholder text shown when no option is selected.',
      control: 'text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Choose an option...' },
      },
    },
    options: {
      description:
        'Array of selectable options displayed in the dropdown panel. Each entry is a `DropdownOptionItem` with required `label` and `value` fields, and optional `icon` and `disabled` fields.',
      control: 'object',
      table: {
        type: { summary: 'DropdownOption[]' },
        defaultValue: { summary: '[]' },
      },
    },
    value: {
      description: 'Currently selected option value.',
      control: 'text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
    },
    size: {
      description: 'Controls the height of the dropdown trigger.',
      control: 'select',
      options: ['default', 'lg'],
      table: {
        type: { summary: "'default' | 'lg'" },
        defaultValue: { summary: 'default' },
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
    leadingIcon: {
      description: 'Icon name displayed at the start of the dropdown trigger.',
      control: 'text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
    },
    valueChange: {
      description: 'Emitted when the selected value changes.',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '—' },
        category: 'Events',
      },
    },
  },
};

export default meta;
type Story = StoryObj<IrisDropdownComponent>;

export const Overview: Story = {
  args: { size: 'default', disabled: false, placeholder: 'Choose a country...', leadingIcon: '' },
  argTypes: {
    size: { control: 'select', options: ['default', 'lg'] },
    disabled: { control: 'boolean' },
    value: { table: { disable: true } },
    options: { table: { disable: true } },
    valueChange: { table: { disable: true } },
  },
  render: (args) => ({
    props: { ...args, sampleOptions },
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;max-width:320px;">
        <iris-form-field>
          <iris-label>Country</iris-label>
          <iris-dropdown [options]="sampleOptions" [placeholder]="placeholder" [size]="size" [disabled]="disabled" [leadingIcon]="leadingIcon ?? ''"></iris-dropdown>
        </iris-form-field>
      </div>
    `,
  }),
};

export const Default: Story = {
  render: () => ({
    props: { sampleOptions },
    template: `
      <iris-form-field>
        <iris-label>Country</iris-label>
        <iris-dropdown [options]="sampleOptions" placeholder="Choose a country..."></iris-dropdown>
      </iris-form-field>
    `,
  }),
};

export const WithoutFormField: Story = {
  render: () => ({
    props: { sampleOptions },
    template: `<iris-dropdown [options]="sampleOptions" placeholder="Choose a country..."></iris-dropdown>`,
  }),
};

export const Large: Story = {
  render: () => ({
    props: { sampleOptions },
    template: `
      <iris-form-field>
        <iris-label>Country</iris-label>
        <iris-dropdown [options]="sampleOptions" placeholder="Choose a country..." size="lg"></iris-dropdown>
      </iris-form-field>
    `,
  }),
};

export const Disabled: Story = {
  render: () => ({
    props: { sampleOptions },
    template: `
      <iris-form-field>
        <iris-label>Country</iris-label>
        <iris-dropdown [options]="sampleOptions" placeholder="Choose a country..." [disabled]="true"></iris-dropdown>
      </iris-form-field>
    `,
  }),
};

export const WithHelpText: Story = {
  render: () => ({
    props: { sampleOptions },
    template: `
      <iris-form-field>
        <iris-label>Country</iris-label>
        <iris-dropdown [options]="sampleOptions" placeholder="Choose a country..."></iris-dropdown>
        <iris-subtext type="hint">Select the country where you reside.</iris-subtext>
      </iris-form-field>
    `,
  }),
};

export const WithError: Story = {
  render: () => ({
    props: {
      sampleOptions,
      control: (() => {
        const formControl = new FormControl('', [Validators.required]);
        formControl.markAsTouched();
        return formControl;
      })(),
    },
    template: `
      <iris-form-field>
        <iris-label>Country</iris-label>
        <iris-dropdown [options]="sampleOptions" placeholder="Choose a country..." [formControl]="control"></iris-dropdown>
        @if (control.hasError('required')) {
          <iris-subtext type="error">Please select a country.</iris-subtext>
        }
      </iris-form-field>
    `,
  }),
};

export const WithLeadingIcon: Story = {
  render: () => ({
    props: { sampleOptions },
    template: `
      <iris-form-field>
        <iris-label>Country</iris-label>
        <iris-dropdown [options]="sampleOptions" placeholder="Choose a country..." leadingIcon="GlobeHemisphereEast
"></iris-dropdown>
      </iris-form-field>
    `,
  }),
};
