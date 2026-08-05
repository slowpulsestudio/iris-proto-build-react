// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Directive, ElementRef, Injector, OnDestroy, inject, input } from '@angular/core';
import { IrisTooltipComponent } from './tooltip.component';
import { TooltipPosition } from './tooltip.model';

let tooltipIdCounter = 0;

@Directive({
  selector: '[irisTooltip]',
  standalone: true,
  host: {
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
    '(focusin)': 'show()',
    '(focusout)': 'hide()',
  },
})
export class IrisTooltipDirective implements OnDestroy {
  readonly irisTooltip = input.required<string>();
  readonly irisTooltipShortcut = input<string[]>([]);
  readonly irisTooltipPosition = input<TooltipPosition>('top');
  readonly irisTooltipDisabled = input(false);

  private readonly overlay = inject(Overlay);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);

  private overlayRef: OverlayRef | null = null;
  private readonly tooltipId = `iris-tooltip-${++tooltipIdCounter}`;

  show(): void {
    if (this.irisTooltipDisabled() || this.overlayRef) {
      return;
    }

    this.overlayRef = this.overlay.create({
      positionStrategy: this.buildPositionStrategy(),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });

    const portal = new ComponentPortal(IrisTooltipComponent, null, this.injector);
    const componentRef = this.overlayRef.attach(portal);
    componentRef.setInput('text', this.irisTooltip());
    componentRef.setInput('shortcut', this.irisTooltipShortcut());
    componentRef.location.nativeElement.setAttribute('id', this.tooltipId);
    this.elementRef.nativeElement.setAttribute('aria-describedby', this.tooltipId);
  }

  hide(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.elementRef.nativeElement.removeAttribute('aria-describedby');
  }

  ngOnDestroy(): void {
    this.overlayRef?.dispose();
  }

  private buildPositionStrategy() {
    const gap = 8;
    const positionMap: Record<TooltipPosition, ConnectedPosition[]> = {
      top: [{ originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -gap }],
      bottom: [{ originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: gap }],
      left: [{ originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -gap }],
      right: [{ originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: gap }],
    };

    return this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef)
      .withPositions(positionMap[this.irisTooltipPosition()])
      .withPush(false);
  }
}
