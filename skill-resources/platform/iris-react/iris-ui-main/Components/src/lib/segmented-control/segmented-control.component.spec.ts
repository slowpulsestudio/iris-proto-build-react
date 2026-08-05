// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IrisSegmentedControlComponent } from './segmented-control.component';

describe('IrisSegmentedControlComponent', () => {
  let component: IrisSegmentedControlComponent;
  let fixture: ComponentFixture<IrisSegmentedControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisSegmentedControlComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(IrisSegmentedControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render items', () => {
    fixture.componentRef.setInput('items', [
      { label: 'Tab 1', value: 'tab1' },
      { label: 'Tab 2', value: 'tab2' },
      { label: 'Tab 3', value: 'tab3' },
    ]);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.iris-segmented-control__item');
    expect(items.length).toBe(3);
  });

  it('should mark active item', () => {
    fixture.componentRef.setInput('items', [
      { label: 'Tab 1', value: 'tab1' },
      { label: 'Tab 2', value: 'tab2' },
    ]);
    fixture.componentRef.setInput('activeValue', 'tab2');
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.iris-segmented-control__item');
    expect(items[1].classList.contains('iris-segmented-control__item--active')).toBe(true);
  });

  it('should set aria-selected on active item', () => {
    fixture.componentRef.setInput('items', [
      { label: 'Tab 1', value: 'tab1' },
      { label: 'Tab 2', value: 'tab2' },
    ]);
    fixture.componentRef.setInput('activeValue', 'tab1');
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.iris-segmented-control__item');
    expect(items[0].getAttribute('aria-selected')).toBe('true');
    expect(items[1].getAttribute('aria-selected')).toBe('false');
  });

  it('should update active value on select', () => {
    fixture.componentRef.setInput('items', [
      { label: 'Tab 1', value: 'tab1' },
      { label: 'Tab 2', value: 'tab2' },
    ]);
    fixture.detectChanges();
    fixture.nativeElement.querySelectorAll('.iris-segmented-control__item')[1].click();
    expect(component.activeValueState()).toBe('tab2');
  });

  it('should emit activeValueChange with the selected value', () => {
    fixture.componentRef.setInput('items', [
      { label: 'Tab 1', value: 'tab1' },
      { label: 'Tab 2', value: 'tab2' },
    ]);
    fixture.detectChanges();
    const emitted: string[] = [];
    component.activeValueChange.subscribe((value: string) => emitted.push(value));
    fixture.nativeElement.querySelectorAll('.iris-segmented-control__item')[1].click();
    expect(emitted).toEqual(['tab2']);
  });

  it('should give active item tabindex 0 and others -1', () => {
    fixture.componentRef.setInput('items', [
      { label: 'Tab 1', value: 'tab1' },
      { label: 'Tab 2', value: 'tab2' },
    ]);
    fixture.componentRef.setInput('activeValue', 'tab1');
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.iris-segmented-control__item');
    expect(items[0].getAttribute('tabindex')).toBe('0');
    expect(items[1].getAttribute('tabindex')).toBe('-1');
  });

  it('should select next item on ArrowRight', () => {
    fixture.componentRef.setInput('items', [
      { label: 'Tab 1', value: 'tab1' },
      { label: 'Tab 2', value: 'tab2' },
    ]);
    fixture.componentRef.setInput('activeValue', 'tab1');
    fixture.detectChanges();
    const activeButton = fixture.nativeElement.querySelector('.iris-segmented-control__item[tabindex="0"]');
    activeButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(component.activeValueState()).toBe('tab2');
  });

  it('should show label span for text-only item', () => {
    fixture.componentRef.setInput('items', [{ label: 'Tab 1', value: 'tab1' }]);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.iris-segmented-control__item');
    expect(button.querySelector('.iris-segmented-control__label')).toBeTruthy();
    expect(button.getAttribute('aria-label')).toBeNull();
  });

  it('should show icon and set aria-label for icon item in icon-only mode', () => {
    fixture.componentRef.setInput('items', [{ label: 'Buildings', value: 'buildings', iconName: 'BuildingOffice' }]);
    fixture.componentRef.setInput('type', 'icon-only');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.iris-segmented-control__item');
    expect(button.querySelector('iris-icon')).toBeTruthy();
    expect(button.querySelector('.iris-segmented-control__label')).toBeNull();
    expect(button.getAttribute('aria-label')).toBe('Buildings');
  });

  it('should show icon and label in icon-text mode', () => {
    fixture.componentRef.setInput('items', [{ label: 'Buildings', value: 'buildings', iconName: 'BuildingOffice' }]);
    fixture.componentRef.setInput('type', 'icon-text');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.iris-segmented-control__item');
    expect(button.querySelector('iris-icon')).toBeTruthy();
    expect(button.querySelector('.iris-segmented-control__label')).toBeTruthy();
    expect(button.getAttribute('aria-label')).toBeNull();
  });

  it('should hide icon and show label in text-only mode', () => {
    fixture.componentRef.setInput('items', [{ label: 'Buildings', value: 'buildings', iconName: 'BuildingOffice' }]);
    fixture.componentRef.setInput('type', 'text-only');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.iris-segmented-control__item');
    expect(button.querySelector('iris-icon')).toBeNull();
    expect(button.querySelector('.iris-segmented-control__label')).toBeTruthy();
    expect(button.getAttribute('aria-label')).toBeNull();
  });

  it('should fall back to label when icon-only item has no iconName', () => {
    fixture.componentRef.setInput('items', [{ label: 'Settings', value: 'settings' }]);
    fixture.componentRef.setInput('type', 'icon-only');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.iris-segmented-control__item');
    expect(button.querySelector('iris-icon')).toBeNull();
    expect(button.querySelector('.iris-segmented-control__label')).toBeTruthy();
    expect(button.getAttribute('aria-label')).toBeNull();
  });
});

@Component({
  template: `<iris-segmented-control [formControl]="control" [items]="items" />`,
  imports: [IrisSegmentedControlComponent, ReactiveFormsModule],
  standalone: true,
})
class TestHostComponent {
  control = new FormControl('');
  items = [
    { label: 'A', value: 'a' },
    { label: 'B', value: 'b' },
  ];
}

describe('IrisSegmentedControlComponent — CVA', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();
    hostFixture = TestBed.createComponent(TestHostComponent);
    host = hostFixture.componentInstance;
    hostFixture.detectChanges();
  });

  it('should reflect FormControl value via writeValue', () => {
    host.control.setValue('b');
    hostFixture.detectChanges();
    const items = hostFixture.nativeElement.querySelectorAll('.iris-segmented-control__item');
    expect(items[1].classList.contains('iris-segmented-control__item--active')).toBe(true);
  });

  it('should update FormControl value when an item is selected', () => {
    hostFixture.nativeElement.querySelectorAll('.iris-segmented-control__item')[0].click();
    expect(host.control.value).toBe('a');
  });

  it('should mark FormControl as touched when an item is selected', () => {
    expect(host.control.touched).toBe(false);
    hostFixture.nativeElement.querySelectorAll('.iris-segmented-control__item')[0].click();
    expect(host.control.touched).toBe(true);
  });

  it('should disable all items when FormControl is disabled', () => {
    host.control.disable();
    hostFixture.detectChanges();
    const buttons = hostFixture.nativeElement.querySelectorAll('.iris-segmented-control__item');
    buttons.forEach((btn: HTMLButtonElement) => expect(btn.disabled).toBe(true));
  });

  it('should not update value when disabled and item is clicked', () => {
    host.control.disable();
    hostFixture.detectChanges();
    host.control.setValue('a');
    hostFixture.nativeElement.querySelectorAll('.iris-segmented-control__item')[1].click();
    expect(host.control.value).toBe('a');
  });

  it('should expose isInvalid and isTouched as true when control has errors and is touched', () => {
    const debugEl = hostFixture.debugElement.query(
      (el) => el.componentInstance instanceof IrisSegmentedControlComponent,
    );
    const componentInstance = debugEl.componentInstance as IrisSegmentedControlComponent;

    host.control.markAsTouched();
    host.control.setErrors({ required: true }); // triggers statusChanges → subscription reads touched+invalid
    hostFixture.detectChanges();

    expect(componentInstance.isInvalid()).toBe(true);
    expect(componentInstance.isTouched()).toBe(true);
  });

  it('should disable all items when disabled input is true', async () => {
    const standaloneFixture = TestBed.createComponent(IrisSegmentedControlComponent);
    standaloneFixture.componentRef.setInput('disabled', true);
    standaloneFixture.componentRef.setInput('items', [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' },
    ]);
    standaloneFixture.detectChanges();
    const buttons = standaloneFixture.nativeElement.querySelectorAll('.iris-segmented-control__item');
    buttons.forEach((btn: HTMLButtonElement) => expect(btn.disabled).toBe(true));
  });
});
