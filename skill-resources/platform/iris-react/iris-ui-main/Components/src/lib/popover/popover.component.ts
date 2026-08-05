// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, TemplateRef, effect, input } from '@angular/core';
import { PopoverPadding } from './popover.model';

@Component({
  selector: 'iris-popover',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './popover.component.html',
  styleUrl: './popover.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IrisPopoverComponent {
  readonly padding = input<PopoverPadding>('lg');
  readonly ariaLabel = input('');
  readonly contentTemplate = input.required<TemplateRef<unknown>>();

  constructor() {
    if (ngDevMode) {
      effect(() => {
        if (!this.ariaLabel()) {
          console.warn('iris-popover: no ariaLabel provided. The role="dialog" panel has no accessible name.');
        }
      });
    }
  }
}

export type { PopoverPadding, PopoverPosition } from './popover.model';
