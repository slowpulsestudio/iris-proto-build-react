// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { Directive, OnInit, TemplateRef, inject } from '@angular/core';
import { IRIS_MODAL_CONTAINER } from './modal.model';

/**
 * Marks a template as the footer of an `<iris-modal>` or a service-opened modal.
 *
 * Template usage — place on `<ng-template>` inside `<iris-modal>`:
 * ```html
 * <iris-modal>
 *   <ng-template irisModalFooter>
 *     <iris-button variant="secondary" (click)="modal.close()">Cancel</iris-button>
 *     <iris-button (click)="modal.close(true)">Confirm</iris-button>
 *   </ng-template>
 * </iris-modal>
 * ```
 *
 * Service usage — place on `<ng-template>` inside the content component:
 * ```ts
 * @Component({
 *   imports: [IrisModalFooterDirective],
 *   template: `
 *     <p>Body content</p>
 *     <ng-template irisModalFooter>
 *       <iris-button (click)="modalRef.close()">OK</iris-button>
 *     </ng-template>
 *   `,
 * })
 * ```
 */
@Directive({
  selector: '[irisModalFooter]',
  standalone: true,
})
export class IrisModalFooterDirective implements OnInit {
  private readonly templateRef = inject(TemplateRef<void>, { optional: true });
  private readonly container = inject(IRIS_MODAL_CONTAINER, { optional: true });

  ngOnInit(): void {
    const outlet = this.container?.footerOutlet();
    if (this.templateRef && outlet) {
      outlet.createEmbeddedView(this.templateRef);
    }
  }
}
