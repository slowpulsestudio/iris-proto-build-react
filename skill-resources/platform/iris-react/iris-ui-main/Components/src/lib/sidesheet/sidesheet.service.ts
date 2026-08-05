// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ApplicationRef, createComponent, inject, Injectable, Injector, Type } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IRIS_SIDESHEET_DATA, IrisSidesheetConfig, IrisSidesheetContent } from './sidesheet-config';
import { IrisSidesheetRef } from './sidesheet-ref';
import { IrisSidesheetComponent } from './sidesheet.component';
import { IRIS_SIDESHEET_CONTAINER } from './sidesheet.model';

/**
 * Opens sidesheets programmatically, without requiring a template declaration.
 * The consumer provides a component type that is created dynamically and rendered
 * inside the sidesheet body. Data is passed via the IRIS_SIDESHEET_DATA injection token.
 *
 * @example
 * const ref = this.sheetService.open(DetailsComponent, {
 *   title: 'Item Details',
 *   data: { itemId: 42 },
 * });
 * ref.afterClosed().subscribe(result => { ... });
 */
@Injectable({ providedIn: 'root' })
export class IrisSidesheetService {
  /** Router is optional — apps without RouterModule skip navigation-close logic. */
  private readonly router = inject(Router, { optional: true });

  private readonly overlay = inject(Overlay);
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(Injector);

  /**
   * Opens a sidesheet with a typed content component.
   * `D` is inferred from the component's `sidesheetData` property (declared via `IrisSidesheetContent<D>`).
   * Pass `R` as an explicit type argument to type the `afterClosed()` result.
   * @example
   * const ref = this.sheetService.open<boolean>(MyComponent, { data: { itemId: 42 } });
   */
  open<R = unknown, D = unknown>(
    component: Type<IrisSidesheetContent<D>>,
    config: IrisSidesheetConfig<D>,
  ): IrisSidesheetRef<R>;
  /** Opens a sidesheet with a content component that has no typed data. */
  open<R = unknown>(component: Type<unknown>, config?: IrisSidesheetConfig): IrisSidesheetRef<R>;
  open(component: Type<unknown>, config: IrisSidesheetConfig = {}): IrisSidesheetRef<unknown> {
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // CDK overlay: GlobalPositionStrategy pins the pane to the right viewport edge.
    // BlockScrollStrategy prevents page scroll while the sidesheet is open.
    // 8px = --oi-spacing-s; CDK applies position/size as inline styles so CSS custom
    // properties cannot be used directly in right()/top()/height() values.
    const gap = '8px';
    const positionStrategy = this.overlay.position().global().right(gap).top(gap);

    const overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      hasBackdrop: true,
      backdropClass: 'iris-sidesheet-backdrop',
      panelClass: 'iris-sidesheet-overlay',
      height: `calc(100dvh - 2 * ${gap})`,
      width: config.width ?? '512px',
    });

    const shellPortal = new ComponentPortal(IrisSidesheetComponent, null, this.injector);
    const shellRef = overlayRef.attach(shellPortal);

    if (config.title !== undefined) {
      shellRef.setInput('title', config.title);
    }
    if (config.subtitle !== undefined) {
      shellRef.setInput('subtitle', config.subtitle);
    }
    if (config.titleIcon !== undefined) {
      shellRef.setInput('titleIcon', config.titleIcon);
    }
    if (config.dismissable !== undefined) {
      shellRef.setInput('dismissable', config.dismissable);
    }
    if (config.closeOnEscape !== undefined) {
      shellRef.setInput('closeOnEscape', config.closeOnEscape);
    }
    if (config.closeOnBackdropClick !== undefined) {
      shellRef.setInput('closeOnBackdropClick', config.closeOnBackdropClick);
    }
    if (config.footerAlign !== undefined) {
      shellRef.setInput('footerAlign', config.footerAlign);
    }
    if (config.enableMaximizeToggle !== undefined) {
      shellRef.setInput('enableMaximizeToggle', config.enableMaximizeToggle);
    }
    if (config.maximized) {
      shellRef.setInput('maximized', true);
      overlayRef.updateSize({ width: `calc(100% - ${gap} * 2)`, height: `calc(100% - ${gap} * 2)` });
      overlayRef.updatePosition();
    }
    if (config.closeAriaLabel !== undefined) {
      shellRef.setInput('closeAriaLabel', config.closeAriaLabel);
    }
    if (config.maximizeAriaLabel !== undefined) {
      shellRef.setInput('maximizeAriaLabel', config.maximizeAriaLabel);
    }
    if (config.restoreAriaLabel !== undefined) {
      shellRef.setInput('restoreAriaLabel', config.restoreAriaLabel);
    }

    const sheetRef = new IrisSidesheetRef();

    let routerSub: Subscription | undefined;

    sheetRef._init(
      (data) => shellRef.instance.close(data),
      () => {
        routerSub?.unsubscribe();
        overlayRef.dispose();
        previouslyFocused?.focus?.();
      },
    );

    shellRef.instance.closed.subscribe((data) => {
      sheetRef._notifyClosed(data);
    });

    // Route CDK backdrop clicks through the component so dismissable/closeOnBackdropClick are respected.
    overlayRef.backdropClick().subscribe(() => shellRef.instance.onBackdropClick());

    // When the user toggles maximize, resize the CDK overlay pane accordingly.
    // calc(100% - 16px) avoids CDK's flush detection (triggered only by exact '100%')
    // so right/top margins remain at 8px — giving equal spacing on all four sides.
    shellRef.instance.maximizedChange.subscribe((isMaximized) => {
      if (isMaximized) {
        overlayRef.updateSize({ width: `calc(100% - ${gap} * 2)`, height: `calc(100% - ${gap} * 2)` });
      } else {
        overlayRef.updateSize({ width: config.width ?? '512px', height: `calc(100dvh - 2 * ${gap})` });
      }
      overlayRef.updatePosition();
    });

    // Close the sidesheet on client-side navigation so overlaid content doesn't persist across routes.
    if (this.router) {
      routerSub = this.router.events
        .pipe(filter((event) => event instanceof NavigationStart))
        .subscribe(() => shellRef.instance.close());
    }

    const contentInjector = Injector.create({
      providers: [
        { provide: IRIS_SIDESHEET_DATA, useValue: config.data ?? null },
        { provide: IrisSidesheetRef, useValue: sheetRef },
        { provide: IRIS_SIDESHEET_CONTAINER, useValue: shellRef.instance },
      ],
      parent: this.injector,
    });

    const contentRef = createComponent(component, {
      environmentInjector: this.appRef.injector,
      elementInjector: contentInjector,
    });

    const bodyOutlet = shellRef.instance.bodyOutlet();
    bodyOutlet?.insert(contentRef.hostView);
    shellRef.changeDetectorRef.detectChanges();

    return sheetRef;
  }
}
