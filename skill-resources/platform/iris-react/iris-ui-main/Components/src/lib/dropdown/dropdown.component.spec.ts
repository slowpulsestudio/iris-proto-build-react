// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { IrisDropdownComponent } from './dropdown.component';
import { DropdownOption } from './dropdown.model';

@Component({
  selector: 'iris-dropdown-host-required',
  template: `<iris-dropdown [options]="options" [formControl]="control"></iris-dropdown>`,
  imports: [IrisDropdownComponent, ReactiveFormsModule],
  standalone: true,
})
class DropdownHostWithRequiredComponent {
  options: DropdownOption[] = [{ type: 'item', label: 'Option A', value: 'a' }];
  control = new FormControl('', [Validators.required]);
}

describe('IrisDropdownComponent', () => {
  let component: IrisDropdownComponent;
  let fixture: ComponentFixture<IrisDropdownComponent>;
  let overlayContainerElement: HTMLElement;

  const sampleOptions: DropdownOption[] = [
    { type: 'item', label: 'Option A', value: 'a' },
    { type: 'item', label: 'Option B', value: 'b' },
    { type: 'item', label: 'Option C', value: 'c', disabled: true },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisDropdownComponent, ReactiveFormsModule],
    }).compileComponents();
    overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();
    fixture = TestBed.createComponent(IrisDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display placeholder when no value is selected', () => {
    fixture.componentRef.setInput('placeholder', 'Select a fruit');
    fixture.detectChanges();
    const valueElement = fixture.nativeElement.querySelector('.iris-dropdown__value');
    expect(valueElement.textContent.trim()).toBe('Select a fruit');
    expect(valueElement.classList.contains('iris-dropdown__value--placeholder')).toBe(true);
  });

  it('should display selected option label when value is set', () => {
    fixture.componentRef.setInput('options', sampleOptions);
    fixture.componentRef.setInput('value', 'b');
    fixture.detectChanges();
    const valueElement = fixture.nativeElement.querySelector('.iris-dropdown__value');
    expect(valueElement.textContent.trim()).toBe('Option B');
    expect(valueElement.classList.contains('iris-dropdown__value--placeholder')).toBe(false);
  });

  it('should apply large size class', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    const wrapper = fixture.nativeElement.querySelector('.iris-dropdown');
    expect(wrapper.classList.contains('iris-dropdown--lg')).toBe(true);
  });

  it('should not open when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('.iris-dropdown__trigger');
    trigger.click();
    fixture.detectChanges();
    const listbox = overlayContainerElement.querySelector('.iris-dropdown__listbox');
    expect(listbox).toBeNull();
  });

  it('should open the listbox on trigger click', () => {
    fixture.componentRef.setInput('options', sampleOptions);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('.iris-dropdown__trigger');
    trigger.click();
    fixture.detectChanges();
    const listbox = overlayContainerElement.querySelector('.iris-dropdown__listbox');
    expect(listbox).toBeTruthy();
    const items = overlayContainerElement.querySelectorAll('.iris-dropdown__option');
    expect(items.length).toBe(3);
  });

  it('should select an option on click and close the listbox', () => {
    fixture.componentRef.setInput('options', sampleOptions);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('.iris-dropdown__trigger');
    trigger.click();
    fixture.detectChanges();
    const items = overlayContainerElement.querySelectorAll('.iris-dropdown__option');
    (items[0] as HTMLElement).click();
    fixture.detectChanges();
    const valueElement = fixture.nativeElement.querySelector('.iris-dropdown__value');
    expect(valueElement.textContent.trim()).toBe('Option A');
    const listbox = overlayContainerElement.querySelector('.iris-dropdown__listbox');
    expect(listbox).toBeNull();
  });

  it('should not select a disabled option', () => {
    fixture.componentRef.setInput('options', sampleOptions);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('.iris-dropdown__trigger');
    trigger.click();
    fixture.detectChanges();
    const items = overlayContainerElement.querySelectorAll('.iris-dropdown__option');
    (items[2] as HTMLElement).click();
    fixture.detectChanges();
    const valueElement = fixture.nativeElement.querySelector('.iris-dropdown__value');
    expect(valueElement.classList.contains('iris-dropdown__value--placeholder')).toBe(true);
  });

  it('should apply error class when control is invalid and touched', () => {
    const hostFixture = TestBed.createComponent(DropdownHostWithRequiredComponent);
    hostFixture.detectChanges();
    hostFixture.componentInstance.control.markAsTouched();
    hostFixture.componentInstance.control.updateValueAndValidity();
    hostFixture.detectChanges();
    const trigger = hostFixture.nativeElement.querySelector('.iris-dropdown__trigger');
    expect(trigger.classList.contains('iris-dropdown__trigger--error')).toBe(true);
  });

  it('should not apply error class when control is invalid but not touched', () => {
    const hostFixture = TestBed.createComponent(DropdownHostWithRequiredComponent);
    hostFixture.detectChanges();
    const trigger = hostFixture.nativeElement.querySelector('.iris-dropdown__trigger');
    expect(trigger.classList.contains('iris-dropdown__trigger--error')).toBe(false);
  });

  it('should show leading icon when leadingIcon is set', () => {
    fixture.componentRef.setInput('leadingIcon', 'search');
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('.iris-dropdown__icon--lead');
    expect(icon).toBeTruthy();
  });

  it('should set aria-required when form control has required validator', () => {
    const hostFixture = TestBed.createComponent(DropdownHostWithRequiredComponent);
    hostFixture.detectChanges();
    const trigger = hostFixture.nativeElement.querySelector('.iris-dropdown__trigger');
    expect(trigger.getAttribute('aria-required')).toBe('true');
  });

  it('should set aria-invalid when control is invalid and touched', () => {
    const hostFixture = TestBed.createComponent(DropdownHostWithRequiredComponent);
    hostFixture.detectChanges();
    hostFixture.componentInstance.control.markAsTouched();
    hostFixture.componentInstance.control.updateValueAndValidity();
    hostFixture.detectChanges();
    const trigger = hostFixture.nativeElement.querySelector('.iris-dropdown__trigger');
    expect(trigger.getAttribute('aria-invalid')).toBe('true');
  });

  describe('CVA', () => {
    it('should call onChange callback when an option is selected', () => {
      fixture.componentRef.setInput('options', sampleOptions);
      fixture.detectChanges();
      let emittedValue: string | undefined;
      component.registerOnChange((value: string) => {
        emittedValue = value;
      });
      const trigger = fixture.nativeElement.querySelector('.iris-dropdown__trigger');
      trigger.click();
      fixture.detectChanges();
      const items = overlayContainerElement.querySelectorAll('.iris-dropdown__option');
      (items[1] as HTMLElement).click();
      fixture.detectChanges();
      expect(emittedValue).toBe('b');
    });

    it('should update display text when writeValue is called', () => {
      fixture.componentRef.setInput('options', sampleOptions);
      component.writeValue('b');
      fixture.detectChanges();
      const valueElement = fixture.nativeElement.querySelector('.iris-dropdown__value');
      expect(valueElement.textContent.trim()).toBe('Option B');
    });

    it('should disable the trigger when setDisabledState(true) is called', () => {
      component.setDisabledState(true);
      fixture.detectChanges();
      const trigger = fixture.nativeElement.querySelector('.iris-dropdown__trigger');
      expect(trigger.classList.contains('iris-dropdown__trigger--disabled')).toBe(true);
      expect(trigger.getAttribute('aria-disabled')).toBe('true');
    });

    it('should re-enable when setDisabledState(false) is called', () => {
      component.setDisabledState(true);
      component.setDisabledState(false);
      fixture.detectChanges();
      const trigger = fixture.nativeElement.querySelector('.iris-dropdown__trigger');
      expect(trigger.classList.contains('iris-dropdown__trigger--disabled')).toBe(false);
    });
  });

  describe('focusout close', () => {
    it('should close when focus moves outside the component', () => {
      fixture.componentRef.setInput('options', sampleOptions);
      fixture.detectChanges();
      const trigger = fixture.nativeElement.querySelector('.iris-dropdown__trigger');
      trigger.click();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelector('.iris-dropdown__listbox')).toBeTruthy();

      const outsideElement = document.createElement('button');
      document.body.appendChild(outsideElement);
      outsideElement.focus();

      const focusoutEvent = new FocusEvent('focusout', { relatedTarget: outsideElement, bubbles: true });
      fixture.nativeElement.dispatchEvent(focusoutEvent);
      fixture.detectChanges();
      expect(overlayContainerElement.querySelector('.iris-dropdown__listbox')).toBeNull();
      document.body.removeChild(outsideElement);
    });

    it('should not close when focus moves to an option in the panel', () => {
      fixture.componentRef.setInput('options', sampleOptions);
      fixture.detectChanges();
      const trigger = fixture.nativeElement.querySelector('.iris-dropdown__trigger');
      trigger.click();
      fixture.detectChanges();

      const innerElement = overlayContainerElement.querySelector<HTMLElement>('.iris-dropdown__option');
      const focusoutEvent = new FocusEvent('focusout', { relatedTarget: innerElement, bubbles: true });
      fixture.nativeElement.dispatchEvent(focusoutEvent);
      fixture.detectChanges();
      expect(overlayContainerElement.querySelector('.iris-dropdown__listbox')).toBeTruthy();
    });
  });

  describe('keyboard navigation', () => {
    it('Escape should close the listbox', () => {
      fixture.componentRef.setInput('options', sampleOptions);
      fixture.detectChanges();
      const trigger = fixture.nativeElement.querySelector('.iris-dropdown__trigger');
      trigger.click();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelector('.iris-dropdown__listbox')).toBeTruthy();

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      trigger.dispatchEvent(escapeEvent);
      fixture.detectChanges();
      expect(overlayContainerElement.querySelector('.iris-dropdown__listbox')).toBeNull();
    });

    it('ArrowDown should open the listbox when closed', () => {
      fixture.componentRef.setInput('options', sampleOptions);
      fixture.detectChanges();
      const trigger = fixture.nativeElement.querySelector('.iris-dropdown__trigger');
      const arrowDownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
      trigger.dispatchEvent(arrowDownEvent);
      fixture.detectChanges();
      expect(overlayContainerElement.querySelector('.iris-dropdown__listbox')).toBeTruthy();
    });
  });

  describe('icon rendering', () => {
    it('should render iris-icon when option has an icon', () => {
      const optionsWithIcon: DropdownOption[] = [
        { type: 'item', label: 'Settings', value: 'settings', icon: 'settings' },
      ];
      fixture.componentRef.setInput('options', optionsWithIcon);
      fixture.detectChanges();
      const trigger = fixture.nativeElement.querySelector('.iris-dropdown__trigger');
      trigger.click();
      fixture.detectChanges();
      const icon = overlayContainerElement.querySelector('.iris-dropdown__option-icon');
      expect(icon).toBeTruthy();
    });
  });
});
