// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IrisIconComponent } from '../icon/icon.component';
import { BannerType } from './banner.model';

@Component({
  selector: 'iris-banner',
  standalone: true,
  imports: [IrisIconComponent],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IrisBannerComponent {
  type = input<BannerType>('info');
  colored = input(false);
  dismissable = input(true);
  dismissAriaLabel = input('Dismiss');
  title = input('');
  supportingText = input('');
  showActions = input(false);
  primaryActionLabel = input('View');
  secondaryActionLabel = input('Dismiss');
  dismissed = output<void>();
  primaryActionClick = output<void>();
  secondaryActionClick = output<void>();

  visible = true;

  protected readonly typeLabel = computed(() => {
    const labels: Record<BannerType, string> = {
      info: 'Info',
      warning: 'Warning',
      error: 'Error',
      success: 'Success',
    };
    return labels[this.type()];
  });

  dismiss(): void {
    this.visible = false;
    this.dismissed.emit();
  }
}

export type { BannerAction, BannerType } from './banner.model';
