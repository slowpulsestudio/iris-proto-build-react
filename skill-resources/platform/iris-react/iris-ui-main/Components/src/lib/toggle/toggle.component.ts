// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, computed, forwardRef, input, model, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'iris-toggle',
  standalone: true,
  imports: [],
  templateUrl: './toggle.component.html',
  styleUrl: './toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IrisToggleComponent),
      multi: true,
    },
  ],
})
export class IrisToggleComponent implements ControlValueAccessor {
  checked = model(false);
  disabled = input(false);
  valueChange = output<boolean>();

  private readonly formDisabled = signal(false);

  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  private notifyChange: (value: boolean) => void = () => undefined;
  private notifyTouched: () => void = () => undefined;

  toggle(): void {
    if (this.isDisabled()) {
      return;
    }
    this.checked.set(!this.checked());
    this.notifyChange(this.checked());
    this.notifyTouched();
    this.valueChange.emit(this.checked());
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

export type { ToggleState } from './toggle.model';
