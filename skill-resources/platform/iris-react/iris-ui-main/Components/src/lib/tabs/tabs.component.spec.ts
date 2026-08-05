// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisTabsComponent } from './tabs.component';

describe('IrisTabsComponent', () => {
  let component: IrisTabsComponent;
  let fixture: ComponentFixture<IrisTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisTabsComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(IrisTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render tab items', () => {
    fixture.componentRef.setInput('items', [
      { label: 'Tab 1', value: 'tab1' },
      { label: 'Tab 2', value: 'tab2' },
      { label: 'Tab 3', value: 'tab3' },
    ]);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.iris-tabs__item');
    expect(items.length).toBe(3);
  });

  it('should mark active tab', () => {
    fixture.componentRef.setInput('items', [
      { label: 'Tab 1', value: 'tab1' },
      { label: 'Tab 2', value: 'tab2' },
    ]);
    fixture.componentRef.setInput('activeValue', 'tab1');
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.iris-tabs__item');
    expect(items[0].classList.contains('iris-tabs__item--active')).toBe(true);
    expect(items[1].classList.contains('iris-tabs__item--active')).toBe(false);
  });

  it('should update active value on tab click', () => {
    fixture.componentRef.setInput('items', [
      { label: 'Tab 1', value: 'tab1' },
      { label: 'Tab 2', value: 'tab2' },
    ]);
    fixture.detectChanges();
    fixture.nativeElement.querySelectorAll('.iris-tabs__item')[1].click();
    expect(component.activeValueState()).toBe('tab2');
  });

  it('should show default counter with parentheses format', () => {
    fixture.componentRef.setInput('items', [{ label: 'Tab 1', value: 'tab1', counter: 5 }]);
    fixture.detectChanges();
    const counter = fixture.nativeElement.querySelector('.iris-tabs__counter');
    expect(counter.textContent.trim()).toBe('(5)');
    expect(counter.classList.contains('iris-tabs__counter--action')).toBe(false);
  });

  it('should show action counter with badge styling', () => {
    fixture.componentRef.setInput('items', [{ label: 'Tab 1', value: 'tab1', counter: 64, counterType: 'action' }]);
    fixture.detectChanges();
    const counter = fixture.nativeElement.querySelector('.iris-tabs__counter');
    expect(counter.classList.contains('iris-tabs__counter--action')).toBe(true);
    expect(counter.textContent.trim()).toBe('64');
  });

  it('should not render counter when counter is undefined', () => {
    fixture.componentRef.setInput('items', [{ label: 'Tab 1', value: 'tab1' }]);
    fixture.detectChanges();
    const counter = fixture.nativeElement.querySelector('.iris-tabs__counter');
    expect(counter).toBeNull();
  });

  it('should render icon when item has icon', () => {
    fixture.componentRef.setInput('items', [{ label: 'Tab 1', value: 'tab1', icon: 'star' }]);
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('iris-icon');
    expect(icon).not.toBeNull();
  });

  it('should not render icon when item has no icon', () => {
    fixture.componentRef.setInput('items', [{ label: 'Tab 1', value: 'tab1' }]);
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('iris-icon');
    expect(icon).toBeNull();
  });

  it('should set aria-selected true on active tab', () => {
    fixture.componentRef.setInput('items', [
      { label: 'Tab 1', value: 'tab1' },
      { label: 'Tab 2', value: 'tab2' },
    ]);
    fixture.componentRef.setInput('activeValue', 'tab2');
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.iris-tabs__item');
    expect(items[0].getAttribute('aria-selected')).toBe('false');
    expect(items[1].getAttribute('aria-selected')).toBe('true');
  });

  it('should give active tab tabindex 0 and others -1', () => {
    fixture.componentRef.setInput('items', [
      { label: 'Tab 1', value: 'tab1' },
      { label: 'Tab 2', value: 'tab2' },
    ]);
    fixture.componentRef.setInput('activeValue', 'tab1');
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.iris-tabs__item');
    expect(items[0].getAttribute('tabindex')).toBe('0');
    expect(items[1].getAttribute('tabindex')).toBe('-1');
  });

  it('should move focus and select next tab on ArrowRight', () => {
    fixture.componentRef.setInput('items', [
      { label: 'Tab 1', value: 'tab1' },
      { label: 'Tab 2', value: 'tab2' },
      { label: 'Tab 3', value: 'tab3' },
    ]);
    fixture.componentRef.setInput('activeValue', 'tab1');
    fixture.detectChanges();
    const activeButton = fixture.nativeElement.querySelector('.iris-tabs__item[tabindex="0"]');
    activeButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(component.activeValueState()).toBe('tab2');
  });

  it('should move focus and select previous tab on ArrowLeft', () => {
    fixture.componentRef.setInput('items', [
      { label: 'Tab 1', value: 'tab1' },
      { label: 'Tab 2', value: 'tab2' },
    ]);
    fixture.componentRef.setInput('activeValue', 'tab2');
    fixture.detectChanges();
    const activeButton = fixture.nativeElement.querySelector('.iris-tabs__item[tabindex="0"]');
    activeButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    fixture.detectChanges();
    expect(component.activeValueState()).toBe('tab1');
  });

  it('should emit activeValueChange on tab click', () => {
    fixture.componentRef.setInput('items', [
      { label: 'Tab 1', value: 'tab1' },
      { label: 'Tab 2', value: 'tab2' },
    ]);
    fixture.detectChanges();
    const emitted: string[] = [];
    component.activeValueChange.subscribe((v: string) => emitted.push(v));
    fixture.nativeElement.querySelectorAll('.iris-tabs__item')[1].click();
    expect(emitted).toEqual(['tab2']);
  });

  it('should not set aria-label on tablist by default', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="tablist"]').getAttribute('aria-label')).toBeNull();
  });

  it('should set aria-label on tablist when ariaLabel is provided', () => {
    fixture.componentRef.setInput('ariaLabel', 'Main navigation');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="tablist"]').getAttribute('aria-label')).toBe('Main navigation');
  });
});
