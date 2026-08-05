// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  InjectionToken,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RadioButtonSize } from './radio-group.model';

export interface IrisRadioGroup {
  value(): string;
  size(): RadioButtonSize;
  isDisabled(): boolean;
  select(value: string): void;
  isTabStop(value: string): boolean;
}

export const IRIS_RADIO_GROUP = new InjectionToken<IrisRadioGroup>('IrisRadioGroup');

@Component({
  selector: 'iris-radio-group',
  standalone: true,
  imports: [],
  templateUrl: './radio-group.component.html',
  styleUrl: './radio-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IrisRadioGroupComponent),
      multi: true,
    },
    {
      provide: IRIS_RADIO_GROUP,
      useExisting: forwardRef(() => IrisRadioGroupComponent),
    },
  ],
  host: {
    role: 'radiogroup',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-disabled]': 'isDisabled()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class IrisRadioGroupComponent implements ControlValueAccessor, IrisRadioGroup {
  readonly ariaLabel = input('');
  readonly size = input<RadioButtonSize>('sm');
  readonly disabled = input(false);
  readonly value = model('');
  readonly selectionChange = output<string>();

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly formDisabled = signal(false);

  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  private notifyChange: (value: string) => void = () => undefined;
  private notifyTouched: () => void = () => undefined;

  constructor() {
    if (ngDevMode) {
      effect(() => {
        if (!this.ariaLabel()) {
          console.warn('iris-radio-group: no ariaLabel provided. A radiogroup without a label fails WCAG 4.1.2.');
        }
      });
    }
  }

  isTabStop(value: string): boolean {
    const currentValue = this.value();
    return currentValue ? value === currentValue : true;
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      return;
    }
    if (this.isDisabled()) {
      return;
    }
    event.preventDefault();

    const allButtons = Array.from(this.elementRef.nativeElement.querySelectorAll('iris-radio-button')) as HTMLElement[];
    const enabledButtons = allButtons.filter((b) => b.getAttribute('aria-disabled') !== 'true');
    if (!enabledButtons.length) {
      return;
    }

    const currentIndex = enabledButtons.findIndex((b) => b.getAttribute('data-value') === this.value());
    const forward = event.key === 'ArrowDown' || event.key === 'ArrowRight';
    const nextIndex = forward
      ? (currentIndex + 1) % enabledButtons.length
      : (currentIndex - 1 + enabledButtons.length) % enabledButtons.length;

    const nextButton = enabledButtons[nextIndex];
    nextButton.focus();
    const nextValue = nextButton.getAttribute('data-value') ?? '';
    if (nextValue) {
      this.select(nextValue);
    }
  }

  select(value: string): void {
    if (this.isDisabled()) {
      return;
    }
    this.value.set(value);
    this.notifyChange(value);
    this.notifyTouched();
    this.selectionChange.emit(value);
  }

  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.notifyChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.notifyTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}

export type { RadioButtonSize } from './radio-group.model';
