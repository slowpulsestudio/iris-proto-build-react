// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  Signal,
  computed,
  forwardRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NgControl, Validators } from '@angular/forms';
import { merge } from 'rxjs';
import { IrisFormControl } from '../form-field/form-field.token';
import { IrisIconComponent } from '../icon/icon.component';
import { IrisTooltipDirective } from '../tooltip/tooltip.directive';
import { SegmentedControlItem, SegmentedControlType } from './segmented-control.model';

@Component({
  selector: 'iris-segmented-control',
  standalone: true,
  imports: [IrisIconComponent, IrisTooltipDirective],
  templateUrl: './segmented-control.component.html',
  styleUrl: './segmented-control.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: IrisFormControl, useExisting: forwardRef(() => IrisSegmentedControlComponent) }],
})
export class IrisSegmentedControlComponent implements ControlValueAccessor, OnInit, IrisFormControl {
  readonly items = input<SegmentedControlItem[]>([]);
  readonly type = input<SegmentedControlType>('icon-only');
  readonly activeValue = input('');
  readonly disabled = input(false);
  readonly activeValueChange = output<string>();

  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly destroyRef = inject(DestroyRef);

  private readonly controlInvalid = signal(false);
  private readonly controlTouched = signal(false);
  private readonly controlDisabled = signal(false);

  readonly activeValueState = linkedSignal(() => this.activeValue());

  readonly isInvalid: Signal<boolean> = computed(() => this.controlInvalid());
  readonly isTouched: Signal<boolean> = computed(() => this.controlTouched());
  readonly isRequired: Signal<boolean> = computed(
    () => this.ngControl?.control?.hasValidator(Validators.required) ?? false,
  );
  readonly countValue: Signal<number> = signal(0);
  readonly countMax: Signal<number> = signal(0);

  protected readonly effectiveDisabled = computed(() => this.disabled() || this.controlDisabled());

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    const control = this.ngControl?.control;
    if (!control) {
      return;
    }

    this.controlInvalid.set(control.invalid);
    this.controlTouched.set(control.touched);
    this.controlDisabled.set(control.disabled);

    merge(control.statusChanges, control.valueChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.controlInvalid.set(control.invalid);
        this.controlTouched.set(control.touched);
        this.controlDisabled.set(control.disabled);
      });
  }

  writeValue(value: string): void {
    this.activeValueState.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.controlDisabled.set(isDisabled);
  }

  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly tabStopValue = computed(() => this.activeValueState() || (this.items()[0]?.value ?? ''));

  protected onKeydown(event: KeyboardEvent): void {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      return;
    }
    if (this.effectiveDisabled()) {
      return;
    }
    event.preventDefault();

    const buttons = Array.from(
      this.elementRef.nativeElement.querySelectorAll('.iris-segmented-control__item:not(:disabled)'),
    ) as HTMLButtonElement[];
    if (!buttons.length) {
      return;
    }

    const currentIndex = buttons.findIndex((b) => b.getAttribute('data-value') === this.activeValueState());
    let nextIndex: number;
    if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = buttons.length - 1;
    } else {
      const forward = event.key === 'ArrowRight';
      nextIndex = forward ? (currentIndex + 1) % buttons.length : (currentIndex - 1 + buttons.length) % buttons.length;
    }

    const nextButton = buttons[nextIndex];
    nextButton.focus();
    const nextValue = nextButton.getAttribute('data-value') ?? '';
    if (nextValue) {
      this.select(nextValue);
    }
  }

  private focusFromMouse = false;

  protected onMouseDown(): void {
    this.focusFromMouse = true;
  }

  protected onFocusIn(): void {
    if (!this.focusFromMouse) {
      this.markTouched();
    }
    this.focusFromMouse = false;
  }

  select(value: string): void {
    if (this.effectiveDisabled()) {
      return;
    }
    this.activeValueState.set(value);
    this.onChange(value);
    this.markTouched();
    this.activeValueChange.emit(value);
  }

  protected markTouched(): void {
    this.onTouched();
    this.controlTouched.set(true);
  }
}

export type { SegmentedControlItem, SegmentedControlType } from './segmented-control.model';
