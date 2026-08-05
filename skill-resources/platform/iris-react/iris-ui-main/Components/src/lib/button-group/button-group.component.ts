// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, contentChildren, effect, input } from '@angular/core';
import { IrisButtonComponent } from '../button/button.component';
import { ButtonGroupDirection, ButtonGroupSize } from './button-group.model';

@Component({
  selector: 'iris-button-group',
  standalone: true,
  imports: [],
  templateUrl: './button-group.component.html',
  styleUrl: './button-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IrisButtonGroupComponent {
  size = input<ButtonGroupSize>('default');
  direction = input<ButtonGroupDirection>('default');
  ariaLabel = input<string>('');

  private readonly buttons = contentChildren(IrisButtonComponent);

  constructor() {
    if (ngDevMode) {
      effect(() => {
        if (!this.ariaLabel()) {
          console.warn(
            'iris-button-group: no ariaLabel provided. Consider labelling the group for screen reader users.',
          );
        }
      });
    }
    effect(() => {
      const groupSize = this.size();
      this.buttons().forEach((btn) => btn.size.set(groupSize));
    });
  }
}

export type { ButtonGroupDirection, ButtonGroupSize } from './button-group.model';
