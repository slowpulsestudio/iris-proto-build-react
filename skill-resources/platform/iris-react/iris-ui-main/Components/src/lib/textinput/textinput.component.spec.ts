// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { IrisTextInputComponent } from './textinput.component';

describe('IrisTextInputComponent', () => {
  let component: IrisTextInputComponent;
  let fixture: ComponentFixture<IrisTextInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisTextInputComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(IrisTextInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply large size class', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    const wrapper = fixture.nativeElement.querySelector('.iris-textinput');
    expect(wrapper.classList.contains('iris-textinput--lg')).toBe(true);
  });

  it('should disable the input when disabled is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const inputElement = fixture.nativeElement.querySelector('.iris-textinput__input');
    expect(inputElement.disabled).toBe(true);
  });

  it('should make the input readonly when readonly is true', () => {
    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();
    const inputElement = fixture.nativeElement.querySelector('.iris-textinput__input');
    expect(inputElement.readOnly).toBe(true);
  });

  it('should show placeholder text', () => {
    fixture.componentRef.setInput('placeholder', 'Enter email');
    fixture.detectChanges();
    const inputElement = fixture.nativeElement.querySelector('.iris-textinput__input');
    expect(inputElement.placeholder).toBe('Enter email');
  });

  it('should update valueState and emit valueChange on input event', () => {
    const emittedValues: string[] = [];
    component.valueChange.subscribe((value: string) => emittedValues.push(value));
    const inputElement = fixture.nativeElement.querySelector('.iris-textinput__input') as HTMLInputElement;
    inputElement.value = 'hello';
    inputElement.dispatchEvent(new Event('input'));
    expect(emittedValues).toEqual(['hello']);
  });
});

@Component({
  selector: 'iris-host-text-input',
  template: `<iris-textinput [formControl]="control"></iris-textinput>`,
  imports: [IrisTextInputComponent, ReactiveFormsModule],
  standalone: true,
})
class TextInputHostComponent {
  control = new FormControl('initial');
}

@Component({
  selector: 'iris-host-text-input-required',
  template: `<iris-textinput [formControl]="control"></iris-textinput>`,
  imports: [IrisTextInputComponent, ReactiveFormsModule],
  standalone: true,
})
class TextInputHostWithRequiredComponent {
  control = new FormControl('', [Validators.required]);
}

describe('IrisTextInputComponent — CVA', () => {
  it('should display value written by the form control', async () => {
    const hostFixture = TestBed.createComponent(TextInputHostComponent);
    hostFixture.detectChanges();
    const inputElement = hostFixture.nativeElement.querySelector('.iris-textinput__input') as HTMLInputElement;
    expect(inputElement.value).toBe('initial');
  });

  it('should propagate user input to the form control', () => {
    const hostFixture = TestBed.createComponent(TextInputHostComponent);
    hostFixture.detectChanges();
    const inputElement = hostFixture.nativeElement.querySelector('.iris-textinput__input') as HTMLInputElement;
    inputElement.value = 'typed';
    inputElement.dispatchEvent(new Event('input'));
    expect(hostFixture.componentInstance.control.value).toBe('typed');
  });

  it('should become disabled when the form control is disabled', () => {
    const hostFixture = TestBed.createComponent(TextInputHostComponent);
    hostFixture.detectChanges();
    hostFixture.componentInstance.control.disable();
    hostFixture.detectChanges();
    const inputElement = hostFixture.nativeElement.querySelector('.iris-textinput__input') as HTMLInputElement;
    expect(inputElement.disabled).toBe(true);
  });

  it('should apply error class when control is invalid and touched', () => {
    const hostFixture = TestBed.createComponent(TextInputHostWithRequiredComponent);
    hostFixture.detectChanges();
    hostFixture.componentInstance.control.markAsTouched();
    hostFixture.componentInstance.control.updateValueAndValidity();
    hostFixture.detectChanges();
    const wrapper = hostFixture.nativeElement.querySelector('.iris-textinput__input-wrapper');
    expect(wrapper.classList.contains('iris-textinput__input-wrapper--error')).toBe(true);
  });

  it('should apply error class immediately after blur without a subsequent value change', () => {
    const hostFixture = TestBed.createComponent(TextInputHostWithRequiredComponent);
    hostFixture.detectChanges();
    const inputElement = hostFixture.nativeElement.querySelector('.iris-textinput__input') as HTMLInputElement;
    inputElement.dispatchEvent(new Event('blur'));
    hostFixture.detectChanges();
    const wrapper = hostFixture.nativeElement.querySelector('.iris-textinput__input-wrapper');
    expect(wrapper.classList.contains('iris-textinput__input-wrapper--error')).toBe(true);
  });
});
