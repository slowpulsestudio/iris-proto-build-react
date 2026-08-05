// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { Directive, OnInit, TemplateRef, inject } from '@angular/core';
import { IRIS_SIDESHEET_CONTAINER } from './sidesheet.model';

/**
 * Marks a template as the footer of an `<iris-sidesheet>` or a service-opened sidesheet.
 *
 * Template usage — place on `<ng-template>` inside `<iris-sidesheet>`:
 * ```html
 * <iris-sidesheet>
 *   <ng-template irisSidesheetFooter>
 *     <iris-button variant="secondary" (click)="sheet.close()">Cancel</iris-button>
 *     <iris-button (click)="sheet.close(true)">Save</iris-button>
 *   </ng-template>
 * </iris-sidesheet>
 * ```
 *
 * Service usage — place on `<ng-template>` inside the content component:
 * ```ts
 * @Component({
 *   imports: [irisSidesheetFooterDirective],
 *   template: `
 *     <p>Body content</p>
 *     <ng-template irisSidesheetFooter>
 *       <iris-button (click)="sheetRef.close()">Save</iris-button>
 *     </ng-template>
 *   `,
 * })
 * ```
 */
@Directive({
  selector: '[irisSidesheetFooter]',
  standalone: true,
})
export class irisSidesheetFooterDirective implements OnInit {
  private readonly templateRef = inject(TemplateRef<void>, { optional: true });
  private readonly container = inject(IRIS_SIDESHEET_CONTAINER, { optional: true });

  ngOnInit(): void {
    const outlet = this.container?.footerOutlet();
    if (this.templateRef && outlet) {
      outlet.createEmbeddedView(this.templateRef);
    }
  }
}
