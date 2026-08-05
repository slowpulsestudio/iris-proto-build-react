// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  DestroyRef,
  ElementRef,
  Injector,
  OnDestroy,
  ViewEncapsulation,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, switchMap, timer } from 'rxjs';
import { IrisIconComponent } from '../icon/icon.component';
import { MenuActionItem, MenuItem } from './menu.model';

const SUBMENU_CLOSE_DELAY_MS = 300;

@Component({
  selector: 'iris-menu',
  standalone: true,
  imports: [IrisIconComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class IrisMenuComponent implements OnDestroy {
  readonly items = input<MenuItem[]>([]);
  readonly itemSelected = output<MenuActionItem>();
  readonly subMenuActive = output<void>();
  readonly arrowLeftPressed = output<void>();

  private readonly menuElement = viewChild<ElementRef<HTMLUListElement>>('menu');

  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  private subMenuRef: OverlayRef | null = null;
  private subMenuComponentRef: ComponentRef<IrisMenuComponent> | null = null;
  private subMenuItemSelectUnsubscribe: (() => void) | null = null;
  private subMenuActiveUnsubscribe: (() => void) | null = null;
  private openSubMenuForItem: MenuItem | null = null;
  private readonly closeScheduler$ = new Subject<boolean>();

  private readonly subMenuGap = 4;

  constructor() {
    this.closeScheduler$
      .pipe(
        switchMap((schedule) => (schedule ? timer(SUBMENU_CLOSE_DELAY_MS) : EMPTY)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.closeSubMenu());
  }

  onItemClick(item: MenuItem, anchorEl: HTMLElement): void {
    if (item.type === 'separator' || item.disabled) {
      return;
    }
    if (item.type === 'item' && item.children?.length) {
      if (this.openSubMenuForItem !== item || !this.subMenuRef) {
        this.clearCloseTimer();
        this.closeSubMenu();
        this.openSubMenuForItem = item;
        this.openSubMenu(item, anchorEl);
      }
      return;
    }
    this.itemSelected.emit(item);
  }

  onItemKeydown(event: KeyboardEvent, item: MenuItem, anchorEl: HTMLElement): void {
    if (item.type === 'separator') {
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.focusNextItem(anchorEl, event.key === 'ArrowDown' ? 1 : -1);
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      this.focusItemAtIndex(0);
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      this.focusItemAtIndex(-1);
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.arrowLeftPressed.emit();
      return;
    }
    if (item.disabled) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (item.type === 'item' && item.children?.length) {
        this.clearCloseTimer();
        if (this.openSubMenuForItem === item && this.subMenuRef) {
          this.subMenuComponentRef?.instance.focusItemAtIndex(0);
        } else {
          this.closeSubMenu();
          this.openSubMenuForItem = item;
          this.openSubMenu(item, anchorEl, true);
        }
      } else {
        this.itemSelected.emit(item);
      }
    }
    if (item.type === 'item' && event.key === 'ArrowRight' && item.children?.length) {
      event.preventDefault();
      this.clearCloseTimer();
      if (this.openSubMenuForItem === item && this.subMenuRef) {
        this.subMenuComponentRef?.instance.focusItemAtIndex(0);
      } else {
        this.closeSubMenu();
        this.openSubMenuForItem = item;
        this.openSubMenu(item, anchorEl, true);
      }
    }
  }

  private getMenuItems(): HTMLElement[] {
    const menu = this.menuElement();
    if (!menu) {
      return [];
    }
    return Array.from(
      menu.nativeElement.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])'),
    );
  }

  private focusNextItem(currentEl: HTMLElement, direction: number): void {
    const items = this.getMenuItems();
    const currentIndex = items.indexOf(currentEl);
    const nextIndex = Math.max(0, Math.min(items.length - 1, currentIndex + direction));
    items[nextIndex]?.focus();
  }

  focusItemAtIndex(index: number): void {
    const items = this.getMenuItems();
    const targetIndex = index === -1 ? items.length - 1 : index;
    items[targetIndex]?.focus();
  }

  onItemMouseEnter(item: MenuItem, anchorEl: HTMLElement): void {
    this.clearCloseTimer();
    if (item.type === 'item' && item.children?.length) {
      if (this.openSubMenuForItem !== item || !this.subMenuRef) {
        this.closeSubMenu();
        this.openSubMenuForItem = item;
        this.openSubMenu(item, anchorEl);
      }
    } else {
      this.scheduleSubMenuClose();
    }
  }

  onItemMouseLeave(): void {
    this.scheduleSubMenuClose();
  }

  ngOnDestroy(): void {
    this.closeSubMenu();
  }

  private openSubMenu(item: MenuActionItem, anchorEl: HTMLElement, focusFirstItem = false): void {
    this.subMenuRef = this.overlay.create({
      positionStrategy: this.buildSubMenuPositionStrategy(anchorEl),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });

    const portal = new ComponentPortal(IrisMenuComponent, null, this.injector);
    const componentRef = this.subMenuRef.attach(portal);
    this.subMenuComponentRef = componentRef;
    componentRef.setInput('items', item.children!);

    if (focusFirstItem) {
      componentRef.changeDetectorRef.detectChanges();
      componentRef.instance.focusItemAtIndex(0);
    }

    const subscription = componentRef.instance.itemSelected.subscribe((selectedItem: MenuActionItem) => {
      this.itemSelected.emit(selectedItem);
      this.closeSubMenu();
    });
    this.subMenuItemSelectUnsubscribe = () => subscription.unsubscribe();

    const activeSubscription = componentRef.instance.subMenuActive.subscribe(() => {
      this.clearCloseTimer();
      this.subMenuActive.emit();
    });
    this.subMenuActiveUnsubscribe = () => activeSubscription.unsubscribe();

    const arrowLeftSubscription = componentRef.instance.arrowLeftPressed.subscribe(() => {
      this.closeSubMenu();
      anchorEl.focus();
    });
    const unsubArrowLeft = () => arrowLeftSubscription.unsubscribe();

    const panelEl = this.subMenuRef.overlayElement;
    panelEl.addEventListener('mouseenter', this.onSubMenuMouseEnter);
    panelEl.addEventListener('mouseleave', this.onSubMenuMouseLeave);

    const originalUnsub = this.subMenuItemSelectUnsubscribe;
    this.subMenuItemSelectUnsubscribe = () => {
      originalUnsub();
      unsubArrowLeft();
    };
  }

  private closeSubMenu(): void {
    if (!this.subMenuRef) {
      return;
    }
    const panelEl = this.subMenuRef.overlayElement;
    panelEl.removeEventListener('mouseenter', this.onSubMenuMouseEnter);
    panelEl.removeEventListener('mouseleave', this.onSubMenuMouseLeave);
    this.subMenuItemSelectUnsubscribe?.();
    this.subMenuItemSelectUnsubscribe = null;
    this.subMenuActiveUnsubscribe?.();
    this.subMenuActiveUnsubscribe = null;
    this.subMenuRef.dispose();
    this.subMenuRef = null;
    this.subMenuComponentRef = null;
    this.openSubMenuForItem = null;
  }

  private scheduleSubMenuClose(): void {
    this.closeScheduler$.next(true);
  }

  private clearCloseTimer(): void {
    this.closeScheduler$.next(false);
  }

  private readonly onSubMenuMouseEnter = (): void => {
    this.clearCloseTimer();
    this.subMenuActive.emit();
  };

  private readonly onSubMenuMouseLeave = (): void => {
    this.scheduleSubMenuClose();
  };

  private buildSubMenuPositionStrategy(anchorEl: HTMLElement) {
    const positions: ConnectedPosition[] = [
      { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: this.subMenuGap },
      { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -this.subMenuGap },
      { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom', offsetX: this.subMenuGap },
      { originX: 'start', originY: 'bottom', overlayX: 'end', overlayY: 'bottom', offsetX: -this.subMenuGap },
    ];
    return this.overlay.position().flexibleConnectedTo(anchorEl).withPositions(positions).withPush(false);
  }
}

export type { MenuItem, MenuItemType, MenuPosition } from './menu.model';
