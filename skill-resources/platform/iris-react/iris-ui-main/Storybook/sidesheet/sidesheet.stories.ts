// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { Component, inject, input } from '@angular/core';
import { IrisButtonComponent } from '@iris-ui/lib/button/button.component';
import { IrisSidesheetContent, injectSheetData } from '@iris-ui/lib/sidesheet/sidesheet-config';
import { irisSidesheetFooterDirective } from '@iris-ui/lib/sidesheet/sidesheet-footer.directive';
import { IrisSidesheetRef } from '@iris-ui/lib/sidesheet/sidesheet-ref';
import { IrisSidesheetComponent } from '@iris-ui/lib/sidesheet/sidesheet.component';
import { IrisSidesheetService } from '@iris-ui/lib/sidesheet/sidesheet.service';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<IrisSidesheetComponent & { width: string }> = {
  title: 'Overlay/Sidesheet',
  component: IrisSidesheetComponent,
  tags: ['preview'],
  argTypes: {
    title: {
      control: 'text',
      description: 'The heading text displayed in the sidesheet header.',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "''" },
      },
    },
    subtitle: {
      control: 'text',
      description: 'Optional subtitle text displayed below the title.',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "''" },
      },
    },
    titleIcon: {
      control: 'text',
      description: 'Icon name displayed to the left of the title. Leave empty to show no icon.',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "''" },
      },
    },
    dismissable: {
      control: 'boolean',
      description:
        'Master dismiss gate. When `false`, the × button is hidden and both Escape and backdrop-click are disabled regardless of their individual flags.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
        category: 'Dismissal',
      },
    },
    closeOnEscape: {
      control: 'boolean',
      description: 'Whether pressing Escape closes the sidesheet. Only applies when `dismissable` is `true`.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
        category: 'Dismissal',
      },
    },
    closeOnBackdropClick: {
      control: 'boolean',
      description: 'Whether clicking the backdrop closes the sidesheet. Only applies when `dismissable` is `true`.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
        category: 'Dismissal',
      },
    },
    enableMaximizeToggle: {
      control: 'boolean',
      description: 'When true, a maximize toggle button is shown in the header actions.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    width: {
      control: 'text',
      description: 'Width of the sidesheet panel. Accepts any valid CSS length.',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "'512px'" },
      },
    },
    maximized: {
      control: 'boolean',
      description: 'Whether the sidesheet is currently expanded to full viewport width.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    closed: {
      description: 'Emits when the sidesheet closes, with optional result data.',
      table: {
        type: { summary: 'unknown' },
        defaultValue: { summary: '—' },
        category: 'Events',
      },
    },
    maximizedChange: {
      description: 'Emitted when the maximize toggle button is clicked, with the new maximized state.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: '—' },
        category: 'Events',
      },
    },
    closeAriaLabel: {
      control: 'text',
      description: 'Accessible label for the close button. Localise for non-English UIs.',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'Close' }, category: 'Accessibility' },
    },
    maximizeAriaLabel: {
      control: 'text',
      description: 'Accessible label for the maximize button. Localise for non-English UIs.',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'Maximize' }, category: 'Accessibility' },
    },
    restoreAriaLabel: {
      control: 'text',
      description: 'Accessible label for the restore button. Localise for non-English UIs.',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'Restore' }, category: 'Accessibility' },
    },
  },
};

export default meta;
type Story = StoryObj<IrisSidesheetComponent & { width: string }>;

/** Content component rendered inside the sidesheet body by IrisSidesheetService. */
@Component({
  selector: 'story-sheet-content',
  standalone: true,
  imports: [IrisButtonComponent, irisSidesheetFooterDirective],
  template: `
    <div style="padding: 16px;">
      <p style="margin: 0; color: var(--oi-content-color-secondary); font-size: var(--oi-font-size-s);">
        Sidesheet body content. This component is rendered dynamically by
        <code>IrisSidesheetService.open()</code>.
        @if (sidesheetData.message) {
          <br /><br />Data: <strong>{{ sidesheetData.message }}</strong>
        }
      </p>
    </div>
    <ng-template irisSidesheetFooter>
      <iris-button variant="secondary" (click)="sheetRef.close(false)">Cancel</iris-button>
      <iris-button (click)="sheetRef.close(true)">Save</iris-button>
    </ng-template>
  `,
})
class SheetContentComponent implements IrisSidesheetContent<{ message?: string }> {
  readonly sidesheetData = injectSheetData<{ message?: string }>();
  protected readonly sheetRef = inject(IrisSidesheetRef<boolean>);
}

/** Host for the default service demo story. */
@Component({
  selector: 'story-sheet-host',
  standalone: true,
  imports: [IrisButtonComponent],
  template: `
    <iris-button (click)="open()">Open sidesheet</iris-button>
    @if (lastResult !== undefined) {
      <p style="margin-top: 12px; font-size: var(--oi-font-size-s); color: var(--oi-content-color-secondary);">
        Last result: <strong>{{ lastResult }}</strong>
      </p>
    }
  `,
})
class SheetHostComponent {
  readonly width = input<string>('512px');

  private readonly sheetService = inject(IrisSidesheetService);
  protected lastResult: boolean | undefined;

  open(): void {
    const sheetRef = this.sheetService.open<boolean>(SheetContentComponent, {
      title: 'Item Details',
      subtitle: 'Browse and select a destination folder',
      titleIcon: 'Placeholder',
      data: { message: 'Hello from IrisSidesheetConfig.data' },
      width: this.width(),
    });
    sheetRef.afterClosed().subscribe((result) => {
      this.lastResult = result;
    });
  }
}

export const WithService: Story = {
  name: 'Default',
  args: { width: '512px' },
  decorators: [moduleMetadata({ imports: [SheetHostComponent] })],
  render: (args) => ({
    template: `<story-sheet-host [width]="width"></story-sheet-host>`,
    props: { width: args.width },
  }),
};

/** Content component for the footer alignment story — demonstrates centered footer via directive. */
@Component({
  selector: 'story-sheet-footer-content',
  standalone: true,
  imports: [IrisButtonComponent, irisSidesheetFooterDirective],
  template: `
    <div style="padding: 16px;">
      <p style="margin: 0; color: var(--oi-content-color-secondary); font-size: var(--oi-font-size-s);">
        Use <code>irisSidesheetFooter</code> on an <code>ng-template</code> to project action buttons into the sidesheet
        footer. The <code>footerAlign</code> config option controls alignment.
      </p>
    </div>
    <ng-template irisSidesheetFooter>
      <iris-button variant="secondary" (click)="sheetRef.close(false)">Cancel</iris-button>
      <iris-button (click)="sheetRef.close(true)">Save</iris-button>
    </ng-template>
  `,
})
class FooterContentComponent {
  protected readonly sheetRef = inject(IrisSidesheetRef<boolean>);
}

/** Host for the footer alignment story. */
@Component({
  selector: 'story-sheet-footer-host',
  standalone: true,
  imports: [IrisButtonComponent],
  template: `<iris-button (click)="open()">Open sidesheet with footer</iris-button>`,
})
class FooterHostComponent {
  private readonly sheetService = inject(IrisSidesheetService);

  open(): void {
    this.sheetService.open(FooterContentComponent, {
      title: 'Footer Alignment',
      subtitle: 'Centered footer actions',
      footerAlign: 'center',
    });
  }
}

export const WithFooterAlignment: Story = {
  decorators: [moduleMetadata({ imports: [FooterHostComponent] })],
  render: () => ({
    template: `<story-sheet-footer-host></story-sheet-footer-host>`,
  }),
};

/** Host for the non-dismissable story. */
@Component({
  selector: 'story-sheet-nondismissable-host',
  standalone: true,
  imports: [IrisButtonComponent],
  template: `<iris-button (click)="open()">Open non-dismissable sidesheet</iris-button>`,
})
class NonDismissableHostComponent {
  private readonly sheetService = inject(IrisSidesheetService);

  open(): void {
    this.sheetService.open(NonDismissableContentComponent, {
      title: 'Required Action',
      subtitle: 'Complete this before continuing',
      dismissable: false,
    });
  }
}

@Component({
  selector: 'story-sheet-nondismissable-content',
  standalone: true,
  imports: [IrisButtonComponent, irisSidesheetFooterDirective],
  template: `
    <div style="padding: 16px;">
      <p style="margin: 0; color: var(--oi-content-color-secondary); font-size: var(--oi-font-size-s);">
        This sidesheet cannot be dismissed via the backdrop or Escape. Use the button to close it explicitly.
      </p>
    </div>
    <ng-template irisSidesheetFooter>
      <iris-button (click)="sheetRef.close()">Done</iris-button>
    </ng-template>
  `,
})
class NonDismissableContentComponent {
  protected readonly sheetRef = inject(IrisSidesheetRef);
}

export const NonDismissable: Story = {
  decorators: [moduleMetadata({ imports: [NonDismissableHostComponent] })],
  render: () => ({
    template: '<story-sheet-nondismissable-host></story-sheet-nondismissable-host>',
  }),
};

/** Host for the maximizable story. */
@Component({
  selector: 'story-sheet-maximizable-host',
  standalone: true,
  imports: [IrisButtonComponent],
  template: `<iris-button (click)="open()">Open maximizable sidesheet</iris-button>`,
})
class MaximizableHostComponent {
  readonly width = input<string>('512px');

  private readonly sheetService = inject(IrisSidesheetService);

  open(): void {
    this.sheetService.open(MaximizableContentComponent, {
      title: 'Full Detail View',
      subtitle: 'Expand to fill the screen',
      enableMaximizeToggle: true,
      width: this.width(),
    });
  }
}

@Component({
  selector: 'story-sheet-maximizable-content',
  standalone: true,
  imports: [IrisButtonComponent, irisSidesheetFooterDirective],
  template: `
    <div style="padding: 16px;">
      <p style="margin: 0; color: var(--oi-content-color-secondary); font-size: var(--oi-font-size-s);">
        Click the maximize icon in the header to expand to full width.
      </p>
    </div>
    <ng-template irisSidesheetFooter>
      <iris-button variant="secondary" (click)="sheetRef.close()">Cancel</iris-button>
      <iris-button (click)="sheetRef.close(true)">Save</iris-button>
    </ng-template>
  `,
})
class MaximizableContentComponent {
  protected readonly sheetRef = inject(IrisSidesheetRef);
}

export const Maximizable: Story = {
  args: { width: '512px' },
  decorators: [moduleMetadata({ imports: [MaximizableHostComponent] })],
  render: (args) => ({
    template: `<story-sheet-maximizable-host [width]="width"></story-sheet-maximizable-host>`,
    props: { width: args.width },
  }),
};

/** Host for the pre-maximized story. */
@Component({
  selector: 'story-sheet-premaximized-host',
  standalone: true,
  imports: [IrisButtonComponent],
  template: `<iris-button (click)="open()">Open maximized sidesheet</iris-button>`,
})
class PreMaximizedHostComponent {
  private readonly sheetService = inject(IrisSidesheetService);

  open(): void {
    this.sheetService.open(MaximizableContentComponent, {
      title: 'Full Detail View',
      subtitle: 'Opens already expanded',
      maximized: true,
    });
  }
}

export const OpenMaximized: Story = {
  decorators: [moduleMetadata({ imports: [PreMaximizedHostComponent] })],
  render: () => ({
    template: `<story-sheet-premaximized-host></story-sheet-premaximized-host>`,
  }),
};

/** Host for the title icon story. */
@Component({
  selector: 'story-sheet-titleicon-host',
  standalone: true,
  imports: [IrisButtonComponent],
  template: `<iris-button (click)="open()">Open sidesheet with icon</iris-button>`,
})
class TitleIconHostComponent {
  private readonly sheetService = inject(IrisSidesheetService);

  open(): void {
    this.sheetService.open(SheetContentComponent, {
      title: 'Settings',
      subtitle: 'Configure your preferences',
      titleIcon: 'Gear',
      data: {},
    });
  }
}

export const WithTitleIcon: Story = {
  decorators: [moduleMetadata({ imports: [TitleIconHostComponent, SheetContentComponent] })],
  render: () => ({
    template: '<story-sheet-titleicon-host></story-sheet-titleicon-host>',
  }),
};
