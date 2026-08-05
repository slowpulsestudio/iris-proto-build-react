// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { IrisTextAreaComponent } from './text-area.component';

describe('IrisTextAreaComponent', () => {
  let component: IrisTextAreaComponent;
  let fixture: ComponentFixture<IrisTextAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisTextAreaComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(IrisTextAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable the textarea when disabled is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const textareaElement = fixture.nativeElement.querySelector('.iris-text-area__input');
    expect(textareaElement.disabled).toBe(true);
  });

  it('should make the textarea readonly when readonly is true', () => {
    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();
    const textareaElement = fixture.nativeElement.querySelector('.iris-text-area__input');
    expect(textareaElement.readOnly).toBe(true);
  });

  it('should show placeholder text', () => {
    fixture.componentRef.setInput('placeholder', 'Tell us more');
    fixture.detectChanges();
    const textareaElement = fixture.nativeElement.querySelector('.iris-text-area__input');
    expect(textareaElement.placeholder).toBe('Tell us more');
  });

  it('should update valueState and emit valueChange on input event', () => {
    const emittedValues: string[] = [];
    component.valueChange.subscribe((value: string) => emittedValues.push(value));
    const textareaElement = fixture.nativeElement.querySelector('.iris-text-area__input') as HTMLTextAreaElement;
    textareaElement.value = 'hello';
    textareaElement.dispatchEvent(new Event('input'));
    expect(emittedValues).toEqual(['hello']);
  });
});

@Component({
  selector: 'iris-host-text-area',
  template: `<iris-text-area [formControl]="control"></iris-text-area>`,
  imports: [IrisTextAreaComponent, ReactiveFormsModule],
  standalone: true,
})
class TextAreaHostComponent {
  control = new FormControl('initial');
}

@Component({
  selector: 'iris-host-text-area-required',
  template: `<iris-text-area [formControl]="control"></iris-text-area>`,
  imports: [IrisTextAreaComponent, ReactiveFormsModule],
  standalone: true,
})
class TextAreaHostWithRequiredComponent {
  control = new FormControl('', [Validators.required]);
}

describe('IrisTextAreaComponent — CVA', () => {
  it('should display value written by the form control', () => {
    const hostFixture = TestBed.createComponent(TextAreaHostComponent);
    hostFixture.detectChanges();
    const textareaEl = hostFixture.nativeElement.querySelector('.iris-text-area__input') as HTMLTextAreaElement;
    expect(textareaEl.value).toBe('initial');
  });

  it('should propagate user input to the form control', () => {
    const hostFixture = TestBed.createComponent(TextAreaHostComponent);
    hostFixture.detectChanges();
    const textareaEl = hostFixture.nativeElement.querySelector('.iris-text-area__input') as HTMLTextAreaElement;
    textareaEl.value = 'typed';
    textareaEl.dispatchEvent(new Event('input'));
    expect(hostFixture.componentInstance.control.value).toBe('typed');
  });

  it('should become disabled when the form control is disabled', () => {
    const hostFixture = TestBed.createComponent(TextAreaHostComponent);
    hostFixture.detectChanges();
    hostFixture.componentInstance.control.disable();
    hostFixture.detectChanges();
    const textareaEl = hostFixture.nativeElement.querySelector('.iris-text-area__input') as HTMLTextAreaElement;
    expect(textareaEl.disabled).toBe(true);
  });

  it('should apply error class when control is invalid and touched', () => {
    const hostFixture = TestBed.createComponent(TextAreaHostWithRequiredComponent);
    hostFixture.detectChanges();
    hostFixture.componentInstance.control.markAsTouched();
    hostFixture.componentInstance.control.updateValueAndValidity();
    hostFixture.detectChanges();
    const wrapper = hostFixture.nativeElement.querySelector('.iris-text-area__input-wrapper');
    expect(wrapper.classList.contains('iris-text-area__input-wrapper--error')).toBe(true);
  });
});
