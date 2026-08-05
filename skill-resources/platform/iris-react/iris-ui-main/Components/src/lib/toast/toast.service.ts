// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ApplicationRef, ComponentRef, createComponent, inject, Injectable } from '@angular/core';
import { IrisToastConfig } from './toast-config';
import { IrisToastContainerComponent } from './toast-container.component';
import { IrisToastRef } from './toast-ref';

const DEFAULT_DURATION_MS = 5000;

/**
 * Displays toast notifications programmatically from anywhere in the application.
 *
 * @example
 * const ref = this.toast.show({ type: 'success', title: 'Saved!', duration: 3000 });
 * ref.afterDismissed().subscribe(() => console.log('gone'));
 * // dismiss early:
 * ref.dismiss();
 */
@Injectable({ providedIn: 'root' })
export class IrisToastService {
  private readonly appRef = inject(ApplicationRef);
  private containerRef: ComponentRef<IrisToastContainerComponent> | null = null;

  show(config: IrisToastConfig): IrisToastRef {
    const container = this.getOrCreateContainer();
    const ref = new IrisToastRef();
    const id = container.add(config, ref);

    const hasActions = Boolean(config.primaryActionLabel || config.secondaryActionLabel);
    let duration: number | null;
    if (config.duration !== undefined) {
      duration = config.duration;
    } else {
      duration = hasActions ? null : DEFAULT_DURATION_MS;
    }
    let timerHandle: ReturnType<typeof setTimeout> | null = null;

    ref._init(() => {
      if (timerHandle !== null) {
        clearTimeout(timerHandle);
        timerHandle = null;
      }
      container.initiateRemoval(id);
    });

    if (duration !== null) {
      timerHandle = setTimeout(() => ref.dismiss(), duration);
    }

    return ref;
  }

  private getOrCreateContainer(): IrisToastContainerComponent {
    if (this.containerRef) {
      return this.containerRef.instance;
    }

    const hostEl = document.createElement('div');
    document.body.appendChild(hostEl);

    this.containerRef = createComponent(IrisToastContainerComponent, {
      environmentInjector: this.appRef.injector,
      hostElement: hostEl,
    });

    this.appRef.attachView(this.containerRef.hostView);
    this.containerRef.changeDetectorRef.detectChanges();

    return this.containerRef.instance;
  }
}
