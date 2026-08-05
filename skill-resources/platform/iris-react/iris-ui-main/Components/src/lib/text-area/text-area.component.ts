// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  forwardRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, ControlValueAccessor, NgControl, Validators } from '@angular/forms';
import { merge } from 'rxjs';
import { IrisFormControl, IRIS_FORM_FIELD, IrisFormFieldState } from '../form-field/form-field.token';
import { IrisTextAreaResize } from '@iris-ui/lib/text-area/text-area.model';

@Component({
  selector: 'iris-text-area',
  standalone: true,
  imports: [],
  templateUrl: './text-area.component.html',
  styleUrl: './text-area.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: IrisFormControl, useExisting: forwardRef(() => IrisTextAreaComponent) }],
})
export class IrisTextAreaComponent implements ControlValueAccessor, OnInit, IrisFormControl {
  readonly rows = input<number | null>(null);
  readonly resize = input<IrisTextAreaResize>('vertical');
  readonly placeholder = input('');
  readonly value = input('');
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly valueChange = output<string>();

  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly destroyRef = inject(DestroyRef);
  protected readonly formField = inject<IrisFormFieldState>(IRIS_FORM_FIELD, { optional: true });

  private readonly controlInvalid = signal(false);
  private readonly controlTouched = signal(false);
  private readonly controlDisabled = signal(false);
  private readonly controlMaxLength = signal<number | null>(null);

  protected readonly valueState = linkedSignal(() => this.value());

  readonly isInvalid = computed(() => this.controlInvalid());
  readonly isTouched = computed(() => this.controlTouched());
  readonly isRequired = computed(() => this.ngControl?.control?.hasValidator(Validators.required) ?? false);
  readonly countValue = computed(() => this.valueState().length);
  readonly countMax = computed(() => this.controlMaxLength() ?? 0);

  protected readonly effectiveHasError = computed(
    () => this.ngControl !== null && this.controlInvalid() && this.controlTouched(),
  );
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
    this.controlMaxLength.set(this.extractMaxLength(control));

    merge(control.statusChanges, control.valueChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.controlInvalid.set(control.invalid);
        this.controlTouched.set(control.touched);
        this.controlDisabled.set(control.disabled);
      });
  }

  writeValue(value: string): void {
    this.valueState.set(value ?? '');
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

  onInput(event: Event): void {
    const newValue = (event.target as HTMLTextAreaElement).value;
    this.valueState.set(newValue);
    this.onChange(newValue);
    this.valueChange.emit(newValue);
  }

  onBlur(): void {
    this.onTouched();
  }

  private extractMaxLength(control: AbstractControl): number | null {
    if (!control.validator) {
      return null;
    }
    try {
      const errors = control.validator({ value: 'x'.repeat(65535) } as AbstractControl);
      return (errors?.['maxlength']?.requiredLength as number) ?? null;
    } catch {
      return null;
    }
  }
}

export type { TextAreaState } from './text-area.model';
