// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { IrisIconComponent } from '../icon/icon.component';
import { ButtonSize, ButtonStyle, ButtonType } from './button.model';

@Component({
  selector: 'iris-button',
  standalone: true,
  imports: [IrisIconComponent],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IrisButtonComponent {
  variant = input<ButtonStyle>('primary');
  buttonType = input<ButtonType>('text-only');
  size = model<ButtonSize>('default');
  disabled = input(false);
  iconName = input('');
  type = input<'button' | 'submit' | 'reset'>('button');

  protected readonly iconDisplaySize = computed(() => (this.size() === 'sm' ? 16 : 20));
}

export type { ButtonSize, ButtonState, ButtonStyle, ButtonType } from './button.model';
