// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { inject, InjectionToken } from '@angular/core';
import { ModalFooterAlign, ModalSize } from './modal.model';

/**
 * Marker interface for modal content components that receive typed data.
 * Assign `injectModalData<D>()` to `modalData` to satisfy the interface and
 * enable compile-time checking of the `data` field in `IrisModalService.open()`.
 *
 * @example
 * export class MyComponent implements IrisModalContent<{ itemId: number }> {
 *   readonly modalData = injectModalData<{ itemId: number }>();
 * }
 */
export interface IrisModalContent<D = unknown> {
  /** @internal Type marker — assign `injectModalData<D>()` to satisfy this. */
  readonly modalData: D;
}

export interface IrisModalConfig<D = unknown> {
  /** Width preset of the modal. Defaults to `'md'`. */
  size?: ModalSize;
  /** Heading text shown in the modal header. */
  title?: string;
  /** Sub-heading shown below the title. */
  subtitle?: string;
  /** Icon name shown beside the title in the header. */
  titleIcon?: string;
  /** Whether the × dismiss button is shown in the header. Defaults to `true`. */
  dismissable?: boolean;
  /** Whether pressing Escape closes the modal. Defaults to `true`. */
  closeOnEscape?: boolean;
  /** Whether clicking the backdrop closes the modal. Defaults to `true`. */
  closeOnBackdropClick?: boolean;
  /** Whether a dimmed backdrop is rendered behind the modal. Defaults to `true`. */
  hasBackdrop?: boolean;
  /** Horizontal alignment of the footer action buttons. Defaults to `'end'`. */
  footerAlign?: ModalFooterAlign;
  /** Accessible label for the × close button. Localise for non-English UIs. Defaults to `'Close'`. */
  closeAriaLabel?: string;
  /** Arbitrary data injected into the content component via the `IRIS_MODAL_DATA` token. Retrieve it with `injectModalData<T>()`. Type is inferred from the component's `IrisModalContent<D>` implementation. */
  data?: D;
}

export const IRIS_MODAL_DATA = new InjectionToken<unknown>('IRIS_MODAL_DATA');

/**
 * Typed helper for injecting modal data inside a dynamically-created content component.
 * @example
 * const data = injectModalData<{ itemId: number }>();
 */
export function injectModalData<T>(): T {
  return inject(IRIS_MODAL_DATA) as T;
}
