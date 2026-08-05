// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { inject, InjectionToken } from '@angular/core';

/**
 * Marker interface for sidesheet content components that receive typed data.
 * Assign `injectSheetData<D>()` to `sidesheetData` to satisfy the interface and
 * enable compile-time checking of the `data` field in `IrisSidesheetService.open()`.
 *
 * @example
 * export class MyComponent implements IrisSidesheetContent<{ itemId: number }> {
 *   readonly sidesheetData = injectSheetData<{ itemId: number }>();
 * }
 */
export interface IrisSidesheetContent<D = unknown> {
  /** @internal Type marker — assign `injectSheetData<D>()` to satisfy this. */
  readonly sidesheetData: D;
}

export interface IrisSidesheetConfig<D = unknown> {
  /** Heading text shown in the sidesheet header. */
  title?: string;
  /** Sub-heading shown below the title. */
  subtitle?: string;
  /** Icon name shown beside the title in the header. */
  titleIcon?: string;
  /** Horizontal alignment of footer actions. Defaults to `'end'`. */
  footerAlign?: 'start' | 'center' | 'end';
  /** Whether the × dismiss button is shown in the header. Defaults to `true`. */
  dismissable?: boolean;
  /** Whether pressing Escape closes the sidesheet. Defaults to `true`. */
  closeOnEscape?: boolean;
  /** Whether clicking the backdrop closes the sidesheet. Defaults to `true`. */
  closeOnBackdropClick?: boolean;
  /** Whether a maximize toggle button is shown in the header. Defaults to `false`. */
  enableMaximizeToggle?: boolean;
  /** Whether the sidesheet opens already maximized. Defaults to `false`. */
  maximized?: boolean;
  /** Accessible label for the × close button. Localise for non-English UIs. Defaults to `'Close'`. */
  closeAriaLabel?: string;
  /** Accessible label for the maximize button. Localise for non-English UIs. Defaults to `'Maximize'`. */
  maximizeAriaLabel?: string;
  /** Accessible label for the restore button. Localise for non-English UIs. Defaults to `'Restore'`. */
  restoreAriaLabel?: string;
  /** Arbitrary data injected into the content component via the `IRIS_SIDESHEET_DATA` token. Retrieve it with `injectSheetData<T>()`. Type is inferred from the component's `IrisSidesheetContent<D>` implementation. */
  data?: D;
  /** Width of the sidesheet panel. Accepts any valid CSS length. Defaults to `'512px'`. */
  width?: string;
}

export const IRIS_SIDESHEET_DATA = new InjectionToken<unknown>('IRIS_SIDESHEET_DATA');

/**
 * Typed helper for injecting sidesheet data inside a dynamically-created content component.
 * @example
 * const data = injectSheetData<{ itemId: number }>();
 */
export function injectSheetData<T>(): T {
  return inject(IRIS_SIDESHEET_DATA) as T;
}
