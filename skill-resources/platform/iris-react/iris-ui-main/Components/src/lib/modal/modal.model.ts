// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { InjectionToken, ViewContainerRef } from '@angular/core';

/** Width preset of the modal dialog. */
export type ModalSize = 'sm' | 'md' | 'lg';
/** Horizontal alignment of the footer action buttons. */
export type ModalFooterAlign = 'start' | 'center' | 'end';

/** Interface implemented by IrisModalComponent so the footer directive can resolve it via DI. */
export interface IrisModalContainer {
  footerOutlet(): ViewContainerRef | undefined;
}

export const IRIS_MODAL_CONTAINER = new InjectionToken<IrisModalContainer>('IrisModalContainer');
