// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IrisCheckboxComponent } from './checkbox.component';

describe('IrisCheckboxComponent', () => {
  let component: IrisCheckboxComponent;
  let fixture: ComponentFixture<IrisCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisCheckboxComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(IrisCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle checked on click', () => {
    fixture.componentRef.setInput('checked', false);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.iris-checkbox__container').click();
    expect(component.checked()).toBe(true);
  });

  it('should toggle back to unchecked on second click', () => {
    fixture.componentRef.setInput('checked', true);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.iris-checkbox__container').click();
    expect(component.checked()).toBe(false);
  });

  it('should clear indeterminate and set unchecked on click when indeterminate', () => {
    fixture.componentRef.setInput('indeterminate', true);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.iris-checkbox__container').click();
    expect(component.indeterminate()).toBe(false);
    expect(component.checked()).toBe(false);
  });

  it('should not toggle when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.componentRef.setInput('checked', false);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.iris-checkbox').click();
    expect(component.checked()).toBe(false);
  });

  it('should toggle checked when label is clicked', () => {
    fixture.componentRef.setInput('checked', false);
    fixture.componentRef.setInput('label', 'Accept terms');
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.iris-checkbox__label').click();
    expect(component.checked()).toBe(true);
  });

  it('should apply medium size class', () => {
    fixture.componentRef.setInput('size', 'md');
    fixture.detectChanges();
    const checkboxElement = fixture.nativeElement.querySelector('.iris-checkbox');
    expect(checkboxElement.classList.contains('iris-checkbox--md')).toBe(true);
  });

  it('should display label', () => {
    fixture.componentRef.setInput('label', 'Accept terms');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-checkbox__label').textContent).toBe('Accept terms');
  });

  it('should show mixed state when indeterminate', () => {
    fixture.componentRef.setInput('indeterminate', true);
    fixture.detectChanges();
    const box = fixture.nativeElement.querySelector('.iris-checkbox__box');
    expect(box.classList.contains('iris-checkbox__box--mixed')).toBe(true);
  });

  it('should link supportingText with aria-describedby when provided', () => {
    fixture.componentRef.setInput('supportingText', 'Helper text');
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector('.iris-checkbox');
    const span = fixture.nativeElement.querySelector('.iris-checkbox__supporting-text');
    expect(span.id).toBeTruthy();
    expect(root.getAttribute('aria-describedby')).toBe(span.id);
  });

  it('should not set aria-describedby when supportingText is empty', () => {
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector('.iris-checkbox');
    expect(root.getAttribute('aria-describedby')).toBeNull();
  });

  describe('ControlValueAccessor', () => {
    it('should set checked state via writeValue', () => {
      component.writeValue(true);
      expect(component.checked()).toBe(true);
      component.writeValue(false);
      expect(component.checked()).toBe(false);
    });

    it('should call registered onChange when toggled', () => {
      const onChangeSpy = vi.fn();
      component.registerOnChange(onChangeSpy);
      fixture.componentRef.setInput('checked', false);
      fixture.detectChanges();
      fixture.nativeElement.querySelector('.iris-checkbox').click();
      expect(onChangeSpy).toHaveBeenCalledWith(true);
    });

    it('should call registered onTouched when toggled', () => {
      const onTouchedSpy = vi.fn();
      component.registerOnTouched(onTouchedSpy);
      fixture.nativeElement.querySelector('.iris-checkbox').click();
      expect(onTouchedSpy).toHaveBeenCalled();
    });

    it('should disable the component via setDisabledState', () => {
      component.setDisabledState(true);
      fixture.detectChanges();
      fixture.nativeElement.querySelector('.iris-checkbox').click();
      expect(component.checked()).toBe(false);
    });

    it('should work with ReactiveFormsModule FormControl', async () => {
      @Component({
        standalone: true,
        imports: [IrisCheckboxComponent, ReactiveFormsModule],
        template: `<iris-checkbox [formControl]="control"></iris-checkbox>`,
      })
      class TestHostComponent {
        control = new FormControl(false);
      }

      const hostFixture = TestBed.createComponent(TestHostComponent);
      hostFixture.detectChanges();
      const hostComponent = hostFixture.componentInstance;

      hostFixture.nativeElement.querySelector('.iris-checkbox').click();
      expect(hostComponent.control.value).toBe(true);

      hostComponent.control.setValue(false);
      hostFixture.detectChanges();
      const checkboxInstance = hostFixture.debugElement.query(
        (element) => element.componentInstance instanceof IrisCheckboxComponent,
      )?.componentInstance as IrisCheckboxComponent;
      expect(checkboxInstance.checked()).toBe(false);
    });

    it('should work with ReactiveFormsModule formControlName', () => {
      @Component({
        standalone: true,
        imports: [IrisCheckboxComponent, ReactiveFormsModule],
        template: `
          <form [formGroup]="form">
            <iris-checkbox formControlName="accepted"></iris-checkbox>
          </form>
        `,
      })
      class TestHostComponent {
        form = new FormGroup({ accepted: new FormControl(false) });
      }

      const hostFixture = TestBed.createComponent(TestHostComponent);
      hostFixture.detectChanges();
      const hostComponent = hostFixture.componentInstance;

      hostFixture.nativeElement.querySelector('.iris-checkbox').click();
      expect(hostComponent.form.value).toEqual({ accepted: true });

      hostComponent.form.controls.accepted.setValue(false);
      hostFixture.detectChanges();
      const checkboxInstance = hostFixture.debugElement.query(
        (element) => element.componentInstance instanceof IrisCheckboxComponent,
      )?.componentInstance as IrisCheckboxComponent;
      expect(checkboxInstance.checked()).toBe(false);
    });
  });
});
