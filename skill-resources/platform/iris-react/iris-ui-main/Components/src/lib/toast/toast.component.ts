// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IrisIconComponent } from '../icon/icon.component';
import { ToastType } from './toast.model';

@Component({
  selector: 'iris-toast',
  standalone: true,
  imports: [IrisIconComponent],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IrisToastComponent {
  type = input<ToastType>('info');
  title = input('');
  supportingText = input('');
  primaryActionLabel = input('');
  secondaryActionLabel = input('');
  dismissible = input(true);
  dismissAriaLabel = input('Dismiss');
  infoAriaLabel = input('Info');
  warningAriaLabel = input('Warning');
  errorAriaLabel = input('Error');
  successAriaLabel = input('Success');
  dismissed = output<void>();
  primaryAction = output<void>();
  secondaryAction = output<void>();

  protected readonly liveRole = computed(() =>
    this.type() === 'error' || this.type() === 'warning' ? 'alert' : 'status',
  );

  protected readonly typeLabel = computed(() => {
    const map: Record<ToastType, string> = {
      info: this.infoAriaLabel(),
      warning: this.warningAriaLabel(),
      error: this.errorAriaLabel(),
      success: this.successAriaLabel(),
    };
    return map[this.type()];
  });

  protected readonly hasPrimaryAction = computed(() => this.primaryActionLabel().trim().length > 0);

  protected readonly hasSecondaryAction = computed(() => this.secondaryActionLabel().trim().length > 0);

  dismiss(): void {
    this.dismissed.emit();
  }
}

export type { ToastType } from './toast.model';
