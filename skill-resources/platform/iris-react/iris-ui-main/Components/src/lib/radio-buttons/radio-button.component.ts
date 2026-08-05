// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { IRIS_RADIO_GROUP } from './radio-group.component';

@Component({
  selector: 'iris-radio-button',
  standalone: true,
  imports: [],
  templateUrl: './radio-button.component.html',
  styleUrl: './radio-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'radio',
    '[attr.data-value]': 'value()',
    '[tabindex]': 'tabIndex()',
    '[attr.aria-checked]': 'isChecked()',
    '[attr.aria-disabled]': 'isDisabled()',
    '[class.iris-radio-button--checked]': 'isChecked()',
    '[class.iris-radio-button--disabled]': 'isDisabled()',
    '[class.iris-radio-button--md]': "size() === 'md'",
    '(click)': 'handleSelect()',
    '(keydown.space)': 'handleSpaceKey($event)',
  },
})
export class IrisRadioButtonComponent {
  readonly value = input.required<string>();
  readonly disabled = input(false);
  readonly supportingText = input('');

  private readonly group = inject(IRIS_RADIO_GROUP);

  protected readonly isChecked = computed(() => this.group.value() === this.value());
  protected readonly isDisabled = computed(() => this.group.isDisabled() || this.disabled());
  protected readonly size = computed(() => this.group.size());
  protected readonly tabIndex = computed(() => {
    if (this.isDisabled()) {
      return -1;
    }
    return this.group.isTabStop(this.value()) ? 0 : -1;
  });

  protected handleSelect(): void {
    if (this.isDisabled()) {
      return;
    }
    this.group.select(this.value());
  }

  protected handleSpaceKey(event: Event): void {
    event.preventDefault();
    if (this.isDisabled()) {
      return;
    }
    this.group.select(this.value());
  }
}
