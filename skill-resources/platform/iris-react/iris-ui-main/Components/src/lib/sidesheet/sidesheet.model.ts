// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { InjectionToken, ViewContainerRef } from '@angular/core';

/** Width preset. `'maximized'` expands the sidesheet to fill the viewport width. */
export type SidesheetSize = 'default' | 'maximized';
/** Horizontal alignment of the footer action buttons. */
export type SidesheetFooterAlign = 'start' | 'center' | 'end';

/** Interface implemented by IrisSidesheetComponent so the footer directive can resolve it via DI. */
export interface IrisSidesheetContainer {
  footerOutlet(): ViewContainerRef | undefined;
}

export const IRIS_SIDESHEET_CONTAINER = new InjectionToken<IrisSidesheetContainer>('IrisSidesheetContainer');
