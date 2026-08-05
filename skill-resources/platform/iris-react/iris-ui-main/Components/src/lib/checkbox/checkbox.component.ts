// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, computed, forwardRef, input, model, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CheckboxSize, CheckboxValue } from './checkbox.model';

@Component({
  selector: 'iris-checkbox',
  standalone: true,
  imports: [],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IrisCheckboxComponent),
      multi: true,
    },
  ],
})
export class IrisCheckboxComponent implements ControlValueAccessor {
  checked = model<boolean>(false);
  indeterminate = model<boolean>(false);
  size = input<CheckboxSize>('sm');
  disabled = input(false);
  label = input('');
  supportingText = input('');

  private readonly formDisabled = signal(false);

  protected readonly supportingTextId = `iris-checkbox-supporting-${Math.random().toString(36).slice(2, 9)}`;

  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected readonly state = computed<CheckboxValue>(() => {
    if (this.indeterminate()) {
      return 'mixed';
    }
    return this.checked() ? 'checked' : 'unchecked';
  });

  private notifyChange: (value: boolean) => void = () => undefined;
  private notifyTouched: () => void = () => undefined;

  toggle(): void {
    if (this.isDisabled()) {
      return;
    }
    if (this.indeterminate()) {
      this.indeterminate.set(false);
      this.checked.set(false);
    } else {
      this.checked.set(!this.checked());
    }
    this.notifyChange(this.checked());
    this.notifyTouched();
  }

  writeValue(value: boolean): void {
    this.checked.set(Boolean(value));
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.notifyChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.notifyTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}

export type { CheckboxSize } from './checkbox.model';
