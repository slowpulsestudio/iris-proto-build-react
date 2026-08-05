// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  computed,
  contentChild,
  contentChildren,
  effect,
  forwardRef,
  signal,
} from '@angular/core';
import { IrisSubtextComponent } from '../subtext/subtext.component';
import { IRIS_FORM_FIELD, IrisFormControl, IrisFormFieldState } from './form-field.token';

let nextFormFieldId = 0;

@Component({
  selector: 'iris-form-field',
  standalone: true,
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: IRIS_FORM_FIELD, useExisting: forwardRef(() => IrisFormFieldComponent) }],
})
export class IrisFormFieldComponent implements IrisFormFieldState {
  private readonly formControl = contentChild(IrisFormControl);
  private readonly subtexts = contentChildren(IrisSubtextComponent);

  private readonly fieldId = `iris-ff-${++nextFormFieldId}`;
  readonly labelId = `${this.fieldId}-label`;

  readonly isInvalid = computed(() => this.formControl()?.isInvalid() ?? false);
  readonly isTouched = computed(() => this.formControl()?.isTouched() ?? false);
  readonly showError = computed(() => this.isInvalid() && this.isTouched());
  readonly isRequired = computed(() => this.formControl()?.isRequired() ?? false);
  readonly countValue = computed(() => this.formControl()?.countValue() ?? 0);
  readonly countMax = computed(() => this.formControl()?.countMax() ?? 0);

  private readonly _activeDescriptionId = signal<string | null>(null);
  readonly activeDescriptionId: Signal<string | null> = this._activeDescriptionId.asReadonly();

  constructor() {
    effect(() => {
      const subtexts = this.subtexts();
      const showErr = this.showError();

      subtexts.forEach((sub, i) => sub.setId(`${this.fieldId}-sub-${i}`));

      const errors = subtexts.filter((sub) => sub.type() === 'error');
      errors.forEach((sub, i) => sub.setVisible(showErr && i === 0));

      const hints = subtexts.filter((sub) => sub.type() === 'hint');
      hints.forEach((sub, i) => sub.setVisible(!showErr && i === 0));

      const activeSubtext = showErr ? errors[0] : hints[0];
      const activeIndex = activeSubtext ? subtexts.indexOf(activeSubtext) : -1;
      this._activeDescriptionId.set(activeIndex >= 0 ? `${this.fieldId}-sub-${activeIndex}` : null);
    });
  }
}
