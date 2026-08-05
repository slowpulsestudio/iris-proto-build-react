// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, Injector, OnDestroy, inject, input, output } from '@angular/core';
import { Subscription } from 'rxjs';
import { IrisMenuComponent } from './menu.component';
import { MenuActionItem, MenuItem, MenuPosition } from './menu.model';

let menuIdCounter = 0;

@Directive({
  selector: '[irisMenu]',
  standalone: true,
  host: {
    '(click)': 'toggle()',
    '[attr.aria-haspopup]': '"menu"',
    '[attr.aria-expanded]': 'isOpen',
  },
})
export class IrisMenuDirective implements OnDestroy {
  readonly irisMenu = input.required<MenuItem[]>();
  readonly irisMenuPosition = input<MenuPosition>('bottom-start');
  readonly irisMenuItemSelected = output<MenuActionItem>();

  protected isOpen = false;

  private readonly overlay = inject(Overlay);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);

  private overlayRef: OverlayRef | null = null;
  private menuComponentRef: { instance: IrisMenuComponent } | null = null;
  private backdropClickSubscription: Subscription | null = null;
  private itemSelectedUnsubscribe: (() => void) | null = null;
  private readonly menuId = `iris-menu-${++menuIdCounter}`;

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

    const portal = new ComponentPortal(IrisMenuComponent, null, this.injector);
    const componentRef = this.overlayRef.attach(portal);
    this.menuComponentRef = componentRef;

    componentRef.setInput('items', this.irisMenu());
    componentRef.location.nativeElement.setAttribute('id', this.menuId);
    this.elementRef.nativeElement.setAttribute('aria-controls', this.menuId);

    const itemSubscription = componentRef.instance.itemSelected.subscribe((item: MenuActionItem) => {
      this.irisMenuItemSelected.emit(item);
      this.close();
    });
    this.itemSelectedUnsubscribe = () => itemSubscription.unsubscribe();

    this.backdropClickSubscription = this.overlayRef.backdropClick().subscribe(() => this.close());

    this.document.addEventListener('keydown', this.onDocumentKeyDown);
    this.isOpen = true;
  }

  close(): void {
    if (!this.overlayRef) {
      return;
    }

    this.itemSelectedUnsubscribe?.();
    this.itemSelectedUnsubscribe = null;

    this.backdropClickSubscription?.unsubscribe();
    this.backdropClickSubscription = null;

    this.document.removeEventListener('keydown', this.onDocumentKeyDown);

    this.overlayRef.dispose();
    this.overlayRef = null;
    this.menuComponentRef = null;

    this.elementRef.nativeElement.removeAttribute('aria-controls');
    this.elementRef.nativeElement.focus();
    this.isOpen = false;
  }

  ngOnDestroy(): void {
    this.close();
  }

  private readonly onDocumentKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' || event.key === 'Tab') {
      this.close();
      return;
    }
    const activeInAnyMenu = Boolean(document.activeElement?.closest('[role="menu"]'));
    if (activeInAnyMenu) {
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'Home') {
      event.preventDefault();
      this.menuComponentRef?.instance.focusItemAtIndex(0);
      return;
    }
    if (event.key === 'ArrowUp' || event.key === 'End') {
      event.preventDefault();
      this.menuComponentRef?.instance.focusItemAtIndex(-1);
      return;
    }
  };

  private buildPositionStrategy() {
    const gap = 4;
    return this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef)
      .withPositions(this.buildPositionFallbacks(this.irisMenuPosition(), gap))
      .withPush(false);
  }

  private buildPositionFallbacks(preferred: MenuPosition, gap: number): ConnectedPosition[] {
    const allPositions: Record<MenuPosition, ConnectedPosition> = {
      'bottom-end': { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: gap },
      'bottom-start': { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: gap },
      'top-end': { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -gap },
      'top-start': { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -gap },
    };

    const fallbackOrder: MenuPosition[] = ['bottom-start', 'bottom-end', 'top-start', 'top-end'];
    const ordered = [preferred, ...fallbackOrder.filter((position) => position !== preferred)];
    return ordered.map((position) => allPositions[position]);
  }
}
