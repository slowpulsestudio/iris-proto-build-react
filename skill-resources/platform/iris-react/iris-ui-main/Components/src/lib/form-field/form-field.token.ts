// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { InjectionToken, Signal } from '@angular/core';

/**
 * Abstract class that form-control components (e.g. iris-textinput) extend via
 * `providers: [{ provide: IrisFormControl, useExisting: ... }]`.
 * IrisFormFieldComponent queries content children using this token to read
 * validation state without being coupled to any specific input type.
 */
export abstract class IrisFormControl {
  abstract readonly isInvalid: Signal<boolean>;
  abstract readonly isTouched: Signal<boolean>;
  abstract readonly isRequired: Signal<boolean>;
  abstract readonly countValue: Signal<number>;
  abstract readonly countMax: Signal<number>;
}

export interface IrisFormFieldState {
  readonly showError: Signal<boolean>;
  readonly isRequired: Signal<boolean>;
  readonly countValue: Signal<number>;
  readonly countMax: Signal<number>;
  readonly activeDescriptionId: Signal<string | null>;
  readonly labelId: string;
}

/** Provided by IrisFormFieldComponent so that iris-label can inject it. */
export const IRIS_FORM_FIELD = new InjectionToken<IrisFormFieldState>('IrisFormField');
