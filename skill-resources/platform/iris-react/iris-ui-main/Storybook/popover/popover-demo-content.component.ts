// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { IrisButtonGroupComponent } from '@iris-ui/lib/button-group/button-group.component';
import { IrisButtonComponent } from '@iris-ui/lib/button/button.component';

@Component({
  selector: 'story-popover-demo-content',
  standalone: true,
  imports: [IrisButtonComponent, IrisButtonGroupComponent],
  template: `
    <div class="popover-demo-content">
      <div class="popover-demo-content__title">Popover title</div>
      <p class="popover-demo-content__body">
        This is a short description providing context or additional information relevant to the trigger element.
      </p>
      <iris-button-group direction="reverse">
        <iris-button variant="primary" (click)="confirm.emit()">Confirm</iris-button>
        <iris-button variant="ghost" (click)="dismiss.emit()">Cancel</iris-button>
      </iris-button-group>
    </div>
  `,
  styles: [
    `
      .popover-demo-content {
        min-width: 240px;

        &__title {
          margin: 0;
          font-size: var(--oi-font-size-md);
          font-weight: var(--oi-font-weight-semibold);
          color: var(--oi-content-color-primary);
        }

        &__body {
          margin: 0;
          font-size: var(--oi-font-size-sm);
          color: var(--oi-content-color-secondary);
          line-height: var(--oi-line-height-md);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IrisPopoverDemoContentComponent {
  confirm = output<void>();
  dismiss = output<void>();
}
