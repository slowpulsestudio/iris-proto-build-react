// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';
import { IrisKeyboardKeyComponent } from '../keyboard-key/keyboard-key.component';

@Component({
  selector: 'iris-tooltip',
  standalone: true,
  imports: [IrisKeyboardKeyComponent],
  templateUrl: './tooltip.component.html',
  styleUrl: './tooltip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class IrisTooltipComponent {
  text = input('');
  shortcut = input<string[]>([]);
}

export type { TooltipPosition, TooltipConfig } from './tooltip.model';
