// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, Injector, OnDestroy, TemplateRef, inject, input, output } from '@angular/core';
import { Subscription } from 'rxjs';
import { IrisPopoverComponent } from './popover.component';
import { PopoverPadding, PopoverPosition } from './popover.model';

let popoverIdCounter = 0;

@Directive({
  selector: '[irisPopover]',
  exportAs: 'irisPopover',
  standalone: true,
  host: {
    '[attr.aria-haspopup]': '"dialog"',
    '[attr.aria-expanded]': 'isOpen',
  },
})
export class IrisPopoverDirective implements OnDestroy {
  readonly irisPopover = input.required<TemplateRef<unknown>>();
  readonly irisPopoverPadding = input<PopoverPadding>('lg');
  readonly irisPopoverPosition = input<PopoverPosition>('bottom-center');
  readonly irisPopoverAriaLabel = input('');
  readonly irisPopoverOpened = output<void>();
  readonly irisPopoverClosed = output<void>();

  protected isOpen = false;

  private readonly overlay = inject(Overlay);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);

  private overlayRef: OverlayRef | null = null;
  private backdropClickSubscription: Subscription | null = null;
  private readonly popoverId = `iris-popover-${++popoverIdCounter}`;

  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    if (this.overlayRef) {
      return;
    }

    this.overlayRef = this.overlay.create({
      positionStrategy: this.buildPositionStrategy(),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    });

    const portal = new ComponentPortal(IrisPopoverComponent, null, this.injector);
    const componentRef = this.overlayRef.attach(portal);

    componentRef.setInput('padding', this.irisPopoverPadding());
    componentRef.setInput('contentTemplate', this.irisPopover());
    componentRef.setInput('ariaLabel', this.irisPopoverAriaLabel());
    componentRef.location.nativeElement.setAttribute('id', this.popoverId);
    this.elementRef.nativeElement.setAttribute('aria-controls', this.popoverId);

    this.backdropClickSubscription = this.overlayRef.backdropClick().subscribe(() => this.close());
    this.document.addEventListener('keydown', this.onDocumentKeyDown);

    this.isOpen = true;
    this.irisPopoverOpened.emit();
  }

  close(): void {
    if (!this.overlayRef) {
      return;
    }

    this.backdropClickSubscription?.unsubscribe();
    this.backdropClickSubscription = null;
    this.document.removeEventListener('keydown', this.onDocumentKeyDown);

    this.overlayRef.dispose();
    this.overlayRef = null;

    this.elementRef.nativeElement.removeAttribute('aria-controls');
    this.isOpen = false;
    this.irisPopoverClosed.emit();
  }

  ngOnDestroy(): void {
    this.close();
  }

  private readonly onDocumentKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      this.close();
    }
  };

  private buildPositionStrategy() {
    const gap = 8;
    return this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef)
      .withPositions(this.buildPositionFallbacks(this.irisPopoverPosition(), gap))
      .withPush(false);
  }

  private buildPositionFallbacks(preferred: PopoverPosition, gap: number): ConnectedPosition[] {
    const allPositions: Record<PopoverPosition, ConnectedPosition> = {
      'bottom-start': { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: gap },
      'bottom-center': { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: gap },
      'bottom-end': { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: gap },
      'top-start': { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -gap },
      'top-center': { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -gap },
      'top-end': { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -gap },
    };

    const fallbackOrder: PopoverPosition[] = [
      'bottom-center',
      'bottom-start',
      'bottom-end',
      'top-center',
      'top-start',
      'top-end',
    ];
    const ordered = [preferred, ...fallbackOrder.filter((position) => position !== preferred)];
    return ordered.map((position) => allPositions[position]);
  }
}
