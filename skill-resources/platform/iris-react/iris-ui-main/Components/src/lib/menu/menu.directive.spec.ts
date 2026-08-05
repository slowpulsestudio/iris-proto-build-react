// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IrisMenuDirective } from './menu.directive';
import { MenuActionItem, MenuItem, MenuPosition } from './menu.model';

@Component({
  template: `<button [irisMenu]="items" [irisMenuPosition]="position" (irisMenuItemSelected)="onSelect($event)">
    Open menu
  </button>`,
  imports: [IrisMenuDirective],
})
class TestHostComponent {
  items: MenuItem[] = [
    { id: 'edit', type: 'item', label: 'Edit', icon: 'Pencil' },
    { id: 'delete', type: 'item', label: 'Delete', icon: 'Trash', destructive: true },
    { type: 'separator' },
    { id: 'archive', type: 'item', label: 'Archive', icon: 'Archive', disabled: true },
    {
      id: 'more',
      type: 'item',
      label: 'More',
      children: [
        { id: 'sub-1', type: 'item', label: 'Sub-action 1' },
        { id: 'sub-2', type: 'item', label: 'Sub-action 2' },
      ],
    },
  ];
  position: MenuPosition = 'bottom-start';
  selectedItem: MenuActionItem | undefined;

  onSelect(item: MenuActionItem): void {
    this.selectedItem = item;
  }
}

describe('IrisMenuDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let triggerElement: HTMLElement;
  let overlayContainerElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();

    triggerElement = fixture.nativeElement.querySelector('button');
  });

  it('should create', () => {
    expect(hostComponent).toBeTruthy();
  });

  it('should set aria-haspopup="menu" on trigger', () => {
    expect(triggerElement.getAttribute('aria-haspopup')).toBe('menu');
  });

  it('should set aria-expanded to false when closed', () => {
    expect(triggerElement.getAttribute('aria-expanded')).toBe('false');
  });

  it('should open menu on click', () => {
    triggerElement.click();
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('.iris-menu')).toBeTruthy();
  });

  it('should set aria-expanded to true when open', () => {
    triggerElement.click();
    fixture.detectChanges();
    expect(triggerElement.getAttribute('aria-expanded')).toBe('true');
  });

  it('should set aria-controls on trigger when open', () => {
    triggerElement.click();
    fixture.detectChanges();
    expect(triggerElement.getAttribute('aria-controls')).toMatch(/^iris-menu-\d+$/);
  });

  it('should close menu on second click (toggle)', () => {
    triggerElement.click();
    fixture.detectChanges();
    triggerElement.click();
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('.iris-menu')).toBeNull();
  });

  it('should set aria-expanded to false after close', () => {
    triggerElement.click();
    fixture.detectChanges();
    triggerElement.click();
    fixture.detectChanges();
    expect(triggerElement.getAttribute('aria-expanded')).toBe('false');
  });

  it('should remove aria-controls after close', () => {
    triggerElement.click();
    fixture.detectChanges();
    triggerElement.click();
    fixture.detectChanges();
    expect(triggerElement.getAttribute('aria-controls')).toBeNull();
  });

  it('should close menu on Escape key', () => {
    triggerElement.click();
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('.iris-menu')).toBeNull();
  });

  it('should emit irisMenuItemSelected on item click', () => {
    triggerElement.click();
    fixture.detectChanges();
    const firstItem = overlayContainerElement.querySelector<HTMLElement>('.iris-menu__item');
    firstItem!.click();
    expect(hostComponent.selectedItem).toEqual(hostComponent.items[0]);
  });

  it('should close menu after item selection', () => {
    triggerElement.click();
    fixture.detectChanges();
    const firstItem = overlayContainerElement.querySelector<HTMLElement>('.iris-menu__item');
    firstItem!.click();
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('.iris-menu')).toBeNull();
  });

  it('should render destructive item with --destructive class', () => {
    triggerElement.click();
    fixture.detectChanges();
    const items = overlayContainerElement.querySelectorAll('.iris-menu__item');
    expect(items[1].classList).toContain('iris-menu__item--destructive');
  });

  it('should not emit irisMenuItemSelected for disabled item', () => {
    triggerElement.click();
    fixture.detectChanges();
    const items = overlayContainerElement.querySelectorAll<HTMLElement>('.iris-menu__item');
    const disabledItem = items[2];
    disabledItem.click();
    expect(hostComponent.selectedItem).toBeUndefined();
  });

  it('should not redirect ArrowDown/Up to root menu when focus is inside a sub-menu', () => {
    triggerElement.click();
    fixture.detectChanges();
    const hasChildrenItem = overlayContainerElement.querySelector<HTMLElement>('.iris-menu__item--has-children');
    hasChildrenItem!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    const subMenuItems = overlayContainerElement.querySelectorAll<HTMLElement>('.iris-menu__item');
    // subMenuItems includes root + submenu items; the submenu items are last two
    const firstSubMenuItem = subMenuItems[subMenuItems.length - 2];
    expect(document.activeElement).toBe(firstSubMenuItem);
    firstSubMenuItem.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    // focus should move to second sub-menu item, NOT back to root menu
    expect(document.activeElement).toBe(subMenuItems[subMenuItems.length - 1]);
  });
  it('should not open a second overlay when open() is called while already open', () => {
    triggerElement.click();
    fixture.detectChanges();
    const directive = fixture.debugElement.query(By.directive(IrisMenuDirective)).injector.get(IrisMenuDirective);
    directive.open();
    fixture.detectChanges();
    expect(overlayContainerElement.querySelectorAll('.iris-menu').length).toBe(1);
  });
});
