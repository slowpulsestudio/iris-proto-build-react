// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { KeyboardKeyType } from './keyboard-key.model';

@Component({
  selector: 'iris-keyboard-key',
  standalone: true,
  imports: [],
  templateUrl: './keyboard-key.component.html',
  styleUrl: './keyboard-key.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IrisKeyboardKeyComponent {
  key = input<string | string[]>('');
  type = input<KeyboardKeyType>('default');

  protected readonly displayKeys = computed(() => {
    const value = this.key();
    const keys = Array.isArray(value) ? value : [value];
    return keys.map((label) => {
      if (label.length === 1) {
        return label.toUpperCase();
      }
      return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
    });
  });
}

export type { KeyboardKeyType } from './keyboard-key.model';
