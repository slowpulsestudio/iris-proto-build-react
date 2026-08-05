// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { Component, inject } from '@angular/core';
import { IrisButtonComponent } from '@iris-ui/lib/button/button.component';
import { IrisToastComponent } from '@iris-ui/lib/toast/toast.component';
import { IrisToastService } from '@iris-ui/lib/toast/toast.service';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

@Component({
  selector: 'story-toast-service-demo',
  standalone: true,
  imports: [IrisButtonComponent],
  template: `
    <div style="display:flex;flex-wrap:wrap;gap:8px;">
      <iris-button (click)="showSuccess()">Success</iris-button>
      <iris-button (click)="showInfo()">Info</iris-button>
      <iris-button (click)="showWarning()">Warning</iris-button>
      <iris-button (click)="showError()">Error</iris-button>
    </div>
  `,
})
class ToastServiceDemoComponent {
  private readonly toastService = inject(IrisToastService);

  showInfo(): void {
    this.toastService.show({
      type: 'info',
      title: 'Moonbase Alpha-4',
      supportingText: 'You are currently logged in from Moonbase Alpha-4, located on Luna.',
    });
  }

  showWarning(): void {
    this.toastService.show({
      type: 'warning',
      title: 'Safety checks incomplete',
      supportingText: 'Safety checks must be completed before this mission can be approved.',
    });
  }

  showError(): void {
    this.toastService.show({
      type: 'error',
      title: 'Safety checks have failed',
      supportingText: 'An issue has been discovered with your fuel mixture ratios.',
    });
  }

  showSuccess(): void {
    this.toastService.show({
      type: 'success',
      title: 'Ready for lift-off',
      supportingText: 'Safety checks are complete, and this mission has been approved for launch.',
    });
  }
}

const meta: Meta<IrisToastComponent> = {
  title: 'Overlay/Toast',
  component: IrisToastComponent,
  tags: ['preview'],
  argTypes: {
    type: {
      description: 'Semantic type of the toast, which determines its icon and color.',
      control: 'select',
      options: ['info', 'warning', 'error', 'success'],
      table: { type: { summary: "'info' | 'warning' | 'error' | 'success'" }, defaultValue: { summary: 'info' } },
    },
    title: {
      description: 'Bold heading text at the top of the toast.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: '' } },
    },
    supportingText: {
      description: 'Secondary body copy shown below the title.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: '' } },
    },
    dismissible: {
      description: 'Shows an × button that hides the toast when clicked.',
      control: 'boolean',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
    },
    primaryActionLabel: {
      description: 'Label for the primary action button.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: '' }, category: 'Actions' },
    },
    secondaryActionLabel: {
      description: 'Label for the secondary action button.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: '' }, category: 'Actions' },
    },
    dismissed: {
      description: 'Emitted when the user clicks the dismiss (×) button.',
      table: { type: { summary: 'void' }, defaultValue: { summary: '—' }, category: 'Events' },
    },
    primaryAction: {
      description: 'Emitted when the primary action button is clicked.',
      table: { type: { summary: 'void' }, defaultValue: { summary: '—' }, category: 'Events' },
    },
    secondaryAction: {
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
type Story = StoryObj<IrisToastComponent>;

export const Overview: Story = {
  decorators: [moduleMetadata({ imports: [ToastServiceDemoComponent] })],
  render: () => ({
    template: `<story-toast-service-demo />`,
  }),
};

export const Default: Story = {
  args: {
    type: 'info',
    title: 'Moonbase Alpha-4',
    supportingText: 'You are currently logged in from Moonbase Alpha-4, located on Luna.',
  },
};

export const Warning: Story = {
  args: {
    type: 'warning',
    title: 'Safety checks incomplete',
    supportingText: 'Safety checks must be completed before this mission can be approved.',
  },
};

export const Error: Story = {
  args: {
    type: 'error',
    title: 'Safety checks have failed',
    supportingText: 'An issue has been discovered with your fuel mixture ratios.',
  },
};

export const Success: Story = {
  args: {
    type: 'success',
    title: 'Ready for lift-off',
    supportingText: 'Safety checks are complete, and this mission has been approved for launch.',
  },
};

export const WithActions: Story = {
  args: {
    type: 'info',
    title: 'New mission file available',
    supportingText: 'Mission report AL-4 is ready for review.',
    primaryActionLabel: 'View',
    secondaryActionLabel: 'Dismiss',
  },
};

export const Interactive: Story = {
  parameters: {
    controls: {
      include: ['title', 'supportingText', 'dismissible', 'primaryActionLabel', 'secondaryActionLabel'],
    },
  },
  args: {
    type: 'info',
    title: 'Moonbase Alpha-4',
    supportingText: 'You are currently logged in from Moonbase Alpha-4, located on Luna.',
    dismissible: true,
    primaryActionLabel: 'View',
    secondaryActionLabel: 'Dismiss',
  },
};
