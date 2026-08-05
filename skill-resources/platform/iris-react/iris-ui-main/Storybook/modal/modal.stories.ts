// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { Component, inject } from '@angular/core';
import { IrisButtonComponent } from '@iris-ui/lib/button/button.component';
import { IrisModalContent, injectModalData } from '@iris-ui/lib/modal/modal-config';
import { IrisModalFooterDirective } from '@iris-ui/lib/modal/modal-footer.directive';
import { IrisModalRef } from '@iris-ui/lib/modal/modal-ref';
import { IrisModalComponent } from '@iris-ui/lib/modal/modal.component';
import { IrisModalService } from '@iris-ui/lib/modal/modal.service';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<IrisModalComponent> = {
  title: 'Overlay/Modal',
  component: IrisModalComponent,
  tags: ['preview'],
  decorators: [moduleMetadata({ imports: [IrisButtonComponent] })],
  args: {
    size: 'md',
    title: 'Modal example title',
    subtitle: 'Modal example subtitle for additional context',
    titleIcon: '',
    dismissable: true,
    closeOnEscape: true,
    closeOnBackdropClick: true,
    hasBackdrop: true,
    footerAlign: 'end',
  },
  argTypes: {
    size: {
      description: 'Controls the width of the modal dialog.',
      control: 'select',
      options: ['sm', 'md', 'lg'],
      table: {
        type: { summary: "'sm' | 'md' | 'lg'" },
        defaultValue: { summary: 'md' },
      },
    },
    title: {
      description: 'The heading text displayed in the modal header.',
      control: 'text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "''" },
      },
    },
    subtitle: {
      description: 'Supporting text displayed beneath the title. Also sets aria-describedby on the dialog.',
      control: 'text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "''" },
      },
    },
    titleIcon: {
      description: 'Icon name displayed to the left of the title. Leave empty to show no icon.',
      control: 'text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "''" },
      },
    },
    dismissable: {
      description:
        'Master dismiss gate. When `false`, the X button is hidden and both ESC and backdrop-click are disabled regardless of their individual flags. When `true`, the X button is shown and `closeOnEscape`/`closeOnBackdropClick` control ESC and backdrop behaviour individually.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
        category: 'Dismissal',
      },
    },
    closeOnEscape: {
      description: 'Whether pressing Escape closes the modal. Only applies when `dismissable` is `true`.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
        category: 'Dismissal',
      },
    },
    closeOnBackdropClick: {
      description: 'Whether clicking the backdrop closes the modal. Only applies when `dismissable` is `true`.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
        category: 'Dismissal',
      },
    },
    hasBackdrop: {
      description: 'Whether to render a backdrop behind the modal.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    footerAlign: {
      description: 'Alignment of footer action buttons.',
      control: 'select',
      options: ['start', 'center', 'end'],
      table: {
        type: { summary: "'start' | 'center' | 'end'" },
        defaultValue: { summary: 'end' },
      },
    },
    closed: {
      description: 'Emits when the modal closes, with optional result data.',
      control: false,
      table: {
        type: { summary: 'unknown' },
        defaultValue: { summary: '—' },
        category: 'Events',
      },
    },
    closeAriaLabel: {
      description:
        'Accessible label for the close (×) button, announced by screen readers. Localise for non-English UIs.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'Close' }, category: 'Accessibility' },
    },
  },
};

export default meta;
type Story = StoryObj<IrisModalComponent>;

export const Small: Story = {
  args: {
    size: 'sm',
    title: 'Modal example title',
    subtitle: 'Additional context',
    titleIcon: '',
    dismissable: true,
    hasBackdrop: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <iris-button (click)="modal.open()">Open small modal</iris-button>
      <iris-modal #modal [size]="size" [title]="title" [subtitle]="subtitle" [titleIcon]="titleIcon" [dismissable]="dismissable" [hasBackdrop]="hasBackdrop" [footerAlign]="footerAlign">
        <p>Use the small modal for brief confirmations or simple one-step decisions — such as discarding unsaved changes, or acknowledging a warning. Keep the body to one or two sentences; if more context is needed, consider a medium modal instead.</p>
        <ng-container irisModalFooter>
          <iris-button variant="secondary" (click)="modal.close()">Cancel</iris-button>
          <iris-button (click)="modal.close(true)">Delete</iris-button>
        </ng-container>
      </iris-modal>
    `,
  }),
};

export const Medium: Story = {
  args: {
    size: 'md',
    title: 'Modal example title',
    subtitle: 'Modal example subtitle for additional context',
    titleIcon: '',
    dismissable: true,
    hasBackdrop: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <iris-button (click)="modal.open()">Open medium sized modal</iris-button>
      <iris-modal #modal [size]="size" [title]="title" [subtitle]="subtitle" [titleIcon]="titleIcon" [dismissable]="dismissable" [hasBackdrop]="hasBackdrop" [footerAlign]="footerAlign">
        <p>The medium modal is the default size — use it for interactions that need more room than a brief confirmation but do not require a wide layout. It works well for short forms, review steps, or actions that benefit from a clear title, a sentence or two of context, and a primary call to action.</p>
        <ng-container irisModalFooter>
          <iris-button variant="secondary" (click)="modal.close()">Cancel</iris-button>
          <iris-button (click)="modal.close(true)">Confirm</iris-button>
        </ng-container>
      </iris-modal>
    `,
  }),
};

export const Large: Story = {
  args: {
    size: 'lg',
    title: 'Modal example title',
    subtitle: 'Modal example subtitle for additional context',
    titleIcon: '',
    dismissable: true,
    hasBackdrop: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <iris-button (click)="modal.open()">Open large modal</iris-button>
      <iris-modal #modal [size]="size" [title]="title" [subtitle]="subtitle" [titleIcon]="titleIcon" [dismissable]="dismissable" [hasBackdrop]="hasBackdrop" [footerAlign]="footerAlign">
        <p>Use the large modal when the task requires significant space — such as multi-field forms, detailed settings panels, or content that benefits from a wider reading area. Avoid using large for simple confirmations; reserve it for interactions where the extra width genuinely aids clarity.</p>
        <ng-container irisModalFooter>
          <iris-button variant="secondary" (click)="modal.close()">Cancel</iris-button>
          <iris-button (click)="modal.close(true)">Save</iris-button>
        </ng-container>
      </iris-modal>
    `,
  }),
};

export const WithTitleIcon: Story = {
  args: {
    size: 'md',
    title: 'Modal example title',
    subtitle: 'Modal example subtitle for additional context',
    titleIcon: 'Placeholder',
    dismissable: true,
    hasBackdrop: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <iris-button (click)="modal.open()">Open modal with title icon</iris-button>
      <iris-modal #modal [size]="size" [title]="title" [subtitle]="subtitle" [titleIcon]="titleIcon" [dismissable]="dismissable" [hasBackdrop]="hasBackdrop" [footerAlign]="footerAlign">
        <p>A title icon adds visual weight to the header and helps users instantly recognise the category of action — such as a warning icon for alerts, a settings icon for configuration, or a bell for notifications. Use it when the icon meaningfully reinforces the intent of the modal, not purely for decoration.</p>
        <ng-container irisModalFooter>
          <iris-button variant="secondary" (click)="modal.close()">Not now</iris-button>
          <iris-button (click)="modal.close(true)">Enable</iris-button>
        </ng-container>
      </iris-modal>
    `,
  }),
};

export const Destructive: Story = {
  args: {
    size: 'md',
    title: 'Delete account',
    subtitle: 'This will permanently remove your account and all data',
    titleIcon: 'Trash',
    dismissable: true,
    hasBackdrop: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <iris-button variant="danger" (click)="modal.open()">Open destructive modal</iris-button>
      <iris-modal #modal [size]="size" [title]="title" [subtitle]="subtitle" [titleIcon]="titleIcon" [dismissable]="dismissable" [hasBackdrop]="hasBackdrop" [footerAlign]="footerAlign">
        <p>Use the destructive variant when the primary action permanently deletes data or cannot be undone. Place the destructive action button first in the footer and label it clearly — never use vague labels like "Yes" or "OK". Always provide a cancel path so users can back out safely.</p>
        <ng-container irisModalFooter>
          <iris-button variant="danger" (click)="modal.close(true)">Delete account</iris-button>
          <iris-button variant="secondary" (click)="modal.close()">Cancel</iris-button>
        </ng-container>
      </iris-modal>
    `,
  }),
};

export const NonDismissable: Story = {
  args: {
    size: 'md',
    title: 'Modal example title',
    subtitle: 'Please wait while your payment is being processed',
    titleIcon: '',
    dismissable: false,
    hasBackdrop: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <iris-button (click)="modal.open()">Open not dismissable modal</iris-button>
      <iris-modal #modal [size]="size" [title]="title" [subtitle]="subtitle" [titleIcon]="titleIcon" [dismissable]="dismissable" [hasBackdrop]="hasBackdrop" [footerAlign]="footerAlign">
        <p>Set dismissable to false when the user must complete or explicitly acknowledge an action before continuing — such as a required consent step, an in-progress operation, or a blocking error. Avoid non-dismissable modals for optional tasks; always provide a clear action button so users are never stuck.</p>
        <ng-container irisModalFooter>
          <iris-button (click)="modal.close()">Done</iris-button>
        </ng-container>
      </iris-modal>
    `,
  }),
};

export const BackdropClickDisabled: Story = {
  args: {
    size: 'md',
    title: 'Press Escape or use the × button',
    subtitle: 'Clicking outside this modal will not close it',
    titleIcon: '',
    dismissable: true,
    closeOnBackdropClick: false,
    hasBackdrop: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <iris-button (click)="modal.open()">Open modal (backdrop click disabled)</iris-button>
      <iris-modal #modal [size]="size" [title]="title" [subtitle]="subtitle" [titleIcon]="titleIcon" [dismissable]="dismissable" [closeOnBackdropClick]="closeOnBackdropClick" [hasBackdrop]="hasBackdrop" [footerAlign]="footerAlign">
        <p>Disable backdrop click when accidental clicks outside the panel are likely — for example when the modal sits over an interactive canvas or a complex background. The dismiss button and Escape key remain active, so users are never blocked.</p>
        <ng-container irisModalFooter>
          <iris-button variant="secondary" (click)="modal.close()">Cancel</iris-button>
          <iris-button (click)="modal.close(true)">Confirm</iris-button>
        </ng-container>
      </iris-modal>
    `,
  }),
};

export const FooterAlignCenter: Story = {
  args: {
    size: 'md',
    title: 'Centred footer buttons',
    subtitle: 'Action buttons are centred in the footer',
    titleIcon: '',
    dismissable: true,
    hasBackdrop: true,
    footerAlign: 'center',
  },
  render: (args) => ({
    props: args,
    template: `
      <iris-button (click)="modal.open()">Open modal (footer centred)</iris-button>
      <iris-modal #modal [size]="size" [title]="title" [subtitle]="subtitle" [titleIcon]="titleIcon" [dismissable]="dismissable" [hasBackdrop]="hasBackdrop" [footerAlign]="footerAlign">
        <p>Centre footer buttons when the modal is used as a standalone prompt with equal-weight options — such as a binary choice where neither option is more prominent than the other.</p>
        <ng-container irisModalFooter>
          <iris-button variant="secondary" (click)="modal.close()">Decline</iris-button>
          <iris-button (click)="modal.close(true)">Accept</iris-button>
        </ng-container>
      </iris-modal>
    `,
  }),
};

export const FooterAlignStart: Story = {
  args: {
    size: 'md',
    title: 'Leading footer buttons',
    subtitle: 'Action buttons are aligned to the leading edge',
    titleIcon: '',
    dismissable: true,
    hasBackdrop: true,
    footerAlign: 'start',
  },
  render: (args) => ({
    props: args,
    template: `
      <iris-button (click)="modal.open()">Open modal (footer start)</iris-button>
      <iris-modal #modal [size]="size" [title]="title" [subtitle]="subtitle" [titleIcon]="titleIcon" [dismissable]="dismissable" [hasBackdrop]="hasBackdrop" [footerAlign]="footerAlign">
        <p>Start-aligned footer buttons are rarely needed in standard flows — use only when the surrounding layout strongly suggests a left-anchored reading order, such as a wizard step where the primary action advances the flow from the left.</p>
        <ng-container irisModalFooter>
          <iris-button (click)="modal.close(true)">Next step</iris-button>
          <iris-button variant="secondary" (click)="modal.close()">Go back</iris-button>
        </ng-container>
      </iris-modal>
    `,
  }),
};

/** Content component rendered inside the modal body by IrisModalService. */
@Component({
  selector: 'story-service-modal-content',
  standalone: true,
  imports: [IrisButtonComponent, IrisModalFooterDirective],
  template: `
    <p>
      Modal data: <strong>{{ modalData.message }}</strong>
    </p>
    <p>Close with a result value — the caller receives it via <code>afterClosed()</code>.</p>
    <ng-template irisModalFooter>
      <iris-button variant="secondary" (click)="modalRef.close(false)">Cancel</iris-button>
      <iris-button (click)="modalRef.close(true)">Confirm</iris-button>
    </ng-template>
  `,
})
class ServiceModalContentComponent implements IrisModalContent<{ message: string }> {
  readonly modalData = injectModalData<{ message: string }>();
  protected readonly modalRef = inject(IrisModalRef<boolean>);
}

/** Host component that opens the modal programmatically and reacts to the result. */
@Component({
  selector: 'story-service-modal-host',
  standalone: true,
  imports: [IrisButtonComponent],
  template: `
    <iris-button (click)="open()">Open via IrisModalService</iris-button>
    @if (lastResult !== undefined) {
      <p>
        Last result: <strong>{{ lastResult }}</strong>
      </p>
    }
  `,
})
class ServiceModalHostComponent {
  private readonly modalService = inject(IrisModalService);

  protected lastResult: boolean | undefined;

  open(): void {
    const modalRef = this.modalService.open<boolean>(ServiceModalContentComponent, {
      title: 'Service-opened modal',
      subtitle: 'Opened via IrisModalService.open()',
      data: { message: 'Hello from IrisModalConfig.data' },
    });
    modalRef.afterClosed().subscribe((result) => {
      this.lastResult = result;
    });
  }
}

export const WithService: Story = {
  decorators: [moduleMetadata({ imports: [ServiceModalHostComponent] })],
  render: () => ({
    template: '<story-service-modal-host></story-service-modal-host>',
  }),
};

/** Content component using irisModalFooter on ng-template inside a service-opened modal. */
@Component({
  selector: 'story-service-footer-modal-content',
  standalone: true,
  imports: [IrisButtonComponent, IrisModalFooterDirective],
  template: `
    <p>
      This content component uses <code>irisModalFooter</code> on an <code>ng-template</code> inside a service-opened
      modal.
    </p>
    <ng-template irisModalFooter>
      <iris-button variant="secondary" (click)="modalRef.close(false)">Cancel</iris-button>
      <iris-button (click)="modalRef.close(true)">Confirm</iris-button>
    </ng-template>
  `,
})
class ServiceFooterModalContentComponent {
  protected readonly modalRef = inject(IrisModalRef<boolean>);
}

@Component({
  selector: 'story-service-footer-modal-host',
  standalone: true,
  imports: [IrisButtonComponent],
  template: `<iris-button (click)="open()">Open service modal with footer</iris-button>`,
})
class ServiceFooterModalHostComponent {
  private readonly modalService = inject(IrisModalService);

  open(): void {
    this.modalService.open(ServiceFooterModalContentComponent, {
      title: 'Service modal with footer',
      subtitle: 'Footer rendered via irisModalFooter directive on ng-template',
      footerAlign: 'center',
    });
  }
}

export const WithServiceFooter: Story = {
  decorators: [moduleMetadata({ imports: [ServiceFooterModalHostComponent] })],
  render: () => ({
    template: '<story-service-footer-modal-host></story-service-footer-modal-host>',
  }),
};
