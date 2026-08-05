// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ApplicationRef, ComponentRef, createComponent, inject, Injectable, Injector, Type } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IRIS_MODAL_DATA, IrisModalConfig, IrisModalContent } from './modal-config';
import { IrisModalRef } from './modal-ref';
import { IrisModalComponent } from './modal.component';
import { IRIS_MODAL_CONTAINER } from './modal.model';

/**
 * Opens modal dialogs programmatically, without requiring a template declaration.
 * The consumer provides a component type that is created dynamically and rendered
 * inside the modal body. Data is passed via the IRIS_MODAL_DATA injection token.
 *
 * @example
 * const ref = this.modal.open(ConfirmComponent, {
 *   title: 'Confirm deletion',
 *   data: { itemId: 42 },
 * });
 * ref.afterClosed().subscribe(result => { ... });
 * // or: const result = await firstValueFrom(ref.afterClosed());
 */
@Injectable({ providedIn: 'root' })
export class IrisModalService {
  /** Router is optional — apps without RouterModule skip navigation-close logic. */
  private readonly router = inject(Router, { optional: true });

  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(Injector);

  /**
   * Opens a modal with a typed content component.
   * `D` is inferred from the component's `modalData` property (declared via `IrisModalContent<D>`).
   * Pass `R` as an explicit type argument to type the `afterClosed()` result.
   * @example
   * const ref = this.modal.open<boolean>(MyComponent, { data: { itemId: 42 } });
   */
  open<R = unknown, D = unknown>(component: Type<IrisModalContent<D>>, config: IrisModalConfig<D>): IrisModalRef<R>;
  /** Opens a modal with a content component that has no typed data. */
  open<R = unknown>(component: Type<unknown>, config?: IrisModalConfig): IrisModalRef<R>;
  open(component: Type<unknown>, config: IrisModalConfig = {}): IrisModalRef<unknown> {
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const hostEl = document.createElement('div');
    document.body.appendChild(hostEl);

    const modalComponentRef: ComponentRef<IrisModalComponent> = createComponent(IrisModalComponent, {
      environmentInjector: this.appRef.injector,
      hostElement: hostEl,
    });

    if (config.size !== undefined) {
      modalComponentRef.setInput('size', config.size);
    }
    if (config.title !== undefined) {
      modalComponentRef.setInput('title', config.title);
    }
    if (config.subtitle !== undefined) {
      modalComponentRef.setInput('subtitle', config.subtitle);
    }
    if (config.titleIcon !== undefined) {
      modalComponentRef.setInput('titleIcon', config.titleIcon);
    }
    if (config.dismissable !== undefined) {
      modalComponentRef.setInput('dismissable', config.dismissable);
    }
    if (config.closeOnEscape !== undefined) {
      modalComponentRef.setInput('closeOnEscape', config.closeOnEscape);
    }
    if (config.closeOnBackdropClick !== undefined) {
      modalComponentRef.setInput('closeOnBackdropClick', config.closeOnBackdropClick);
    }
    if (config.hasBackdrop !== undefined) {
      modalComponentRef.setInput('hasBackdrop', config.hasBackdrop);
    }
    if (config.footerAlign !== undefined) {
      modalComponentRef.setInput('footerAlign', config.footerAlign);
    }
    if (config.closeAriaLabel !== undefined) {
      modalComponentRef.setInput('closeAriaLabel', config.closeAriaLabel);
    }

    this.appRef.attachView(modalComponentRef.hostView);
    modalComponentRef.changeDetectorRef.detectChanges();

    const modalRef = new IrisModalRef();

    let routerSub: Subscription | undefined;

    modalRef._init(
      (data) => modalComponentRef.instance.close(data),
      () => {
        routerSub?.unsubscribe();
        this.appRef.detachView(modalComponentRef.hostView);
        modalComponentRef.destroy();
        hostEl.remove();
        previouslyFocused?.focus?.();
      },
    );

    modalComponentRef.instance.closed.subscribe((data) => {
      modalRef._notifyClosed(data);
    });

    // Close the modal on client-side navigation so overlaid content doesn't persist across routes.
    if (this.router) {
      routerSub = this.router.events
        .pipe(filter((event) => event instanceof NavigationStart))
        .subscribe(() => modalComponentRef.instance.close());
    }

    const contentInjector = Injector.create({
      providers: [
        { provide: IRIS_MODAL_DATA, useValue: config.data ?? null },
        { provide: IrisModalRef, useValue: modalRef },
        { provide: IRIS_MODAL_CONTAINER, useValue: modalComponentRef.instance },
      ],
      parent: this.injector,
    });

    const contentRef = createComponent(component, {
      environmentInjector: this.appRef.injector,
      elementInjector: contentInjector,
    });

    const bodyOutlet = modalComponentRef.instance.bodyOutlet();
    bodyOutlet?.insert(contentRef.hostView);

    modalComponentRef.instance.open();
    modalComponentRef.changeDetectorRef.detectChanges();

    return modalRef;
  }
}
