// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { OverlayContainer } from '@angular/cdk/overlay';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisMenuComponent } from './menu.component';
import { MenuActionItem, MenuItem } from './menu.model';

describe('IrisMenuComponent', () => {
  let component: IrisMenuComponent;
  let fixture: ComponentFixture<IrisMenuComponent>;
  let overlayContainerElement: HTMLElement;

  const mockItems: MenuItem[] = [
    { id: 'edit', type: 'item', label: 'Edit', icon: 'Pencil' },
    { id: 'copy', type: 'item', label: 'Copy', icon: 'Copy' },
    { type: 'separator' },
    { id: 'delete', type: 'item', label: 'Delete', icon: 'Trash', disabled: true },
    {
      id: 'more',
      type: 'item',
      label: 'More',
      icon: 'DotsThree',
      children: [
        { id: 'sub-1', type: 'item', label: 'Sub-action 1' },
        { id: 'sub-2', type: 'item', label: 'Sub-action 2' },
      ],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisMenuComponent],
    }).compileComponents();
    overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();
    fixture = TestBed.createComponent(IrisMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render menu items', () => {
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.iris-menu__item');
    expect(items.length).toBe(4);
  });

  it('should render separator', () => {
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();
    const separators = fixture.nativeElement.querySelectorAll('.iris-menu__separator');
    expect(separators.length).toBe(1);
  });

  it('should apply disabled class', () => {
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();
    const disabledItems = fixture.nativeElement.querySelectorAll('.iris-menu__item--disabled');
    expect(disabledItems.length).toBe(1);
  });

  it('should emit itemSelected on click', () => {
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();
    let selectedItem: MenuActionItem | undefined;
    component.itemSelected.subscribe((item: MenuActionItem) => (selectedItem = item));
    const firstItem = fixture.nativeElement.querySelector('.iris-menu__item');
    firstItem.click();
    expect(selectedItem).toEqual(mockItems[0]);
  });

  it('should not emit itemSelected for disabled item', () => {
    let emitted = false;
    component.itemSelected.subscribe(() => (emitted = true));
    component.onItemClick(
      { id: 'disabled-item', type: 'item', label: 'Disabled', disabled: true },
      document.createElement('li'),
    );
    expect(emitted).toBe(false);
  });

  it('should apply has-children class', () => {
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();
    const hasChildrenItems = fixture.nativeElement.querySelectorAll('.iris-menu__item--has-children');
    expect(hasChildrenItems.length).toBe(1);
  });

  it('should apply destructive class', () => {
    fixture.componentRef.setInput('items', [
      { id: 'delete', type: 'item', label: 'Delete', icon: 'Trash', destructive: true },
    ]);
    fixture.detectChanges();
    const destructiveItems = fixture.nativeElement.querySelectorAll('.iris-menu__item--destructive');
    expect(destructiveItems.length).toBe(1);
  });

  it('should not emit itemSelected when clicking a separator', () => {
    let emitted = false;
    component.itemSelected.subscribe(() => (emitted = true));
    component.onItemClick({ type: 'separator' }, document.createElement('li'));
    expect(emitted).toBe(false);
  });

  it('should emit itemSelected on Enter key', () => {
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();
    let selectedItem: MenuActionItem | undefined;
    component.itemSelected.subscribe((item: MenuActionItem) => (selectedItem = item));
    const firstItem = fixture.nativeElement.querySelector('.iris-menu__item');
    firstItem.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(selectedItem).toEqual(mockItems[0]);
  });

  it('should emit itemSelected on Space key', () => {
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();
    let selectedItem: MenuActionItem | undefined;
    component.itemSelected.subscribe((item: MenuActionItem) => (selectedItem = item));
    const firstItem = fixture.nativeElement.querySelector('.iris-menu__item');
    firstItem.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(selectedItem).toEqual(mockItems[0]);
  });

  it('should set tabindex -1 on disabled item', () => {
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();
    const disabledItem = fixture.nativeElement.querySelector('.iris-menu__item--disabled');
    expect(disabledItem.getAttribute('tabindex')).toBe('-1');
  });

  it('should not emit itemSelected for item with children on click', () => {
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();
    let emitted = false;
    component.itemSelected.subscribe(() => (emitted = true));
    const hasChildrenItem = fixture.nativeElement.querySelector('.iris-menu__item--has-children') as HTMLElement;
    hasChildrenItem!.click();
    expect(emitted).toBe(false);
  });

  it('should open sub-menu on mouseenter of item with children', () => {
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();
    const hasChildrenItem = fixture.nativeElement.querySelector('.iris-menu__item--has-children') as HTMLElement;
    hasChildrenItem!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();
    const subMenuItems = overlayContainerElement.querySelectorAll('.iris-menu__item');
    expect(subMenuItems.length).toBe(2);
  });

  it('should emit itemSelected and close sub-menu when sub-menu item is selected', async () => {
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();
    let selectedItem: MenuActionItem | undefined;
    component.itemSelected.subscribe((item: MenuActionItem) => (selectedItem = item));
    const hasChildrenItem = fixture.nativeElement.querySelector('.iris-menu__item--has-children') as HTMLElement;
    hasChildrenItem!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();
    const subMenuItems = overlayContainerElement.querySelectorAll<HTMLElement>('.iris-menu__item');
    subMenuItems[0].click();
    expect(selectedItem?.label).toBe('Sub-action 1');
  });

  it('should open sub-menu on ArrowRight keydown on item with children', () => {
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();
    const hasChildrenItem = fixture.nativeElement.querySelector('.iris-menu__item--has-children') as HTMLElement;
    hasChildrenItem!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    const subMenuItems = overlayContainerElement.querySelectorAll('.iris-menu__item');
    expect(subMenuItems.length).toBe(2);
  });

  it('should schedule sub-menu close on mouse leave from menu item', () => {
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();
    const hasChildrenItem = fixture.nativeElement.querySelector('.iris-menu__item--has-children') as HTMLElement;
    hasChildrenItem!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();
    hasChildrenItem!.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    const subMenuItems = overlayContainerElement.querySelectorAll('.iris-menu__item');
    expect(subMenuItems.length).toBe(2);
  });

  it('should cancel scheduled close when mousing back to parent item', () => {
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();
    const hasChildrenItem = fixture.nativeElement.querySelector('.iris-menu__item--has-children') as HTMLElement;
    hasChildrenItem!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();
    hasChildrenItem!.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    hasChildrenItem!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();
    const subMenuItems = overlayContainerElement.querySelectorAll('.iris-menu__item');
    expect(subMenuItems.length).toBe(2);
  });

  it('should cancel close on sub-menu panel mouseenter and schedule on mouseleave', () => {
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();
    const hasChildrenItem = fixture.nativeElement.querySelector('.iris-menu__item--has-children') as HTMLElement;
    hasChildrenItem!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();
    hasChildrenItem!.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    const subMenu = overlayContainerElement.querySelector('.iris-menu') as HTMLElement;
    const pane = subMenu.parentElement!.parentElement as HTMLElement;
    pane.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(overlayContainerElement.querySelectorAll('.iris-menu__item').length).toBe(2);
    pane.dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    expect(overlayContainerElement.querySelectorAll('.iris-menu__item').length).toBe(2);
  });

  it('should cancel scheduled close and open sub-menu on Enter key on item with children', () => {
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();
    const hasChildrenItem = fixture.nativeElement.querySelector('.iris-menu__item--has-children') as HTMLElement;
    hasChildrenItem!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    const subMenuItems = overlayContainerElement.querySelectorAll('.iris-menu__item');
    expect(subMenuItems.length).toBe(2);
  });

  it('should not open sub-menu on Enter key on a disabled item', () => {
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();
    const disabledItem = fixture.nativeElement.querySelector('.iris-menu__item--disabled') as HTMLElement;
    disabledItem!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    const subMenuItems = overlayContainerElement.querySelectorAll('.iris-menu__item');
    expect(subMenuItems.length).toBe(0);
  });

  it('should focus first sub-menu item on ArrowRight keydown on item with children', () => {
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();
    const hasChildrenItem = fixture.nativeElement.querySelector('.iris-menu__item--has-children') as HTMLElement;
    hasChildrenItem!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    const subMenuItems = overlayContainerElement.querySelectorAll<HTMLElement>('.iris-menu__item');
    expect(subMenuItems.length).toBe(2);
    expect(document.activeElement).toBe(subMenuItems[0]);
  });

  it('should focus first sub-menu item when ArrowRight pressed on already-open sub-menu parent', () => {
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();
    const hasChildrenItem = fixture.nativeElement.querySelector('.iris-menu__item--has-children') as HTMLElement;
    hasChildrenItem!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();
    hasChildrenItem!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    const subMenuItems = overlayContainerElement.querySelectorAll<HTMLElement>('.iris-menu__item');
    expect(subMenuItems.length).toBe(2);
    expect(document.activeElement).toBe(subMenuItems[0]);
  });

  it('should focus first sub-menu item on Enter keydown on item with children', () => {
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();
    const hasChildrenItem = fixture.nativeElement.querySelector('.iris-menu__item--has-children') as HTMLElement;
    hasChildrenItem!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    const subMenuItems = overlayContainerElement.querySelectorAll<HTMLElement>('.iris-menu__item');
    expect(subMenuItems.length).toBe(2);
    expect(document.activeElement).toBe(subMenuItems[0]);
  });

  it('should close sub-menu and focus parent item on ArrowLeft in sub-menu', () => {
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();
    const hasChildrenItem = fixture.nativeElement.querySelector('.iris-menu__item--has-children') as HTMLElement;
    hasChildrenItem!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    const subMenuItems = overlayContainerElement.querySelectorAll<HTMLElement>('.iris-menu__item');
    expect(subMenuItems.length).toBe(2);
    subMenuItems[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    fixture.detectChanges();
    expect(overlayContainerElement.querySelectorAll('.iris-menu__item').length).toBe(0);
    expect(document.activeElement).toBe(hasChildrenItem);
  });

  it('should schedule sub-menu close on mouseenter of item without children', () => {
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();
    const hasChildrenItem = fixture.nativeElement.querySelector('.iris-menu__item--has-children') as HTMLElement;
    hasChildrenItem!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();
    expect(overlayContainerElement.querySelectorAll('.iris-menu__item').length).toBe(2);
    const firstItem = fixture.nativeElement.querySelector('.iris-menu__item') as HTMLElement;
    firstItem!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    expect(overlayContainerElement.querySelectorAll('.iris-menu__item').length).toBe(2);
  });
});
