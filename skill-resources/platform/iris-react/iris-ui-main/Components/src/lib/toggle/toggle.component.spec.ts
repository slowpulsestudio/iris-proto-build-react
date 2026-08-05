// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisToggleComponent } from './toggle.component';

describe('IrisToggleComponent', () => {
  let component: IrisToggleComponent;
  let fixture: ComponentFixture<IrisToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisToggleComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(IrisToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle state on click', () => {
    fixture.nativeElement.querySelector('button').click();
    expect(component.checked()).toBe(true);
  });

  it('should not toggle when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const initialValue = component.checked();
    fixture.nativeElement.querySelector('button').click();
    expect(component.checked()).toBe(initialValue);
  });

  it('should apply on class when checked', () => {
    fixture.componentRef.setInput('checked', true);
    fixture.detectChanges();
    const toggleElement = fixture.nativeElement.querySelector('.iris-toggle');
    expect(toggleElement.classList.contains('iris-toggle--on')).toBe(true);
  });

  it('should have role switch', () => {
    const switchButton = fixture.nativeElement.querySelector('[role="switch"]');
    expect(switchButton).toBeTruthy();
  });

  it('should set checked state via writeValue', () => {
    component.writeValue(true);
    expect(component.checked()).toBe(true);
    component.writeValue(false);
    expect(component.checked()).toBe(false);
  });

  it('should notify change callback when toggled', () => {
    const onChange = vi.fn();
    component.registerOnChange(onChange);
    fixture.nativeElement.querySelector('button').click();
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('should disable toggle via setDisabledState', () => {
    component.setDisabledState(true);
    fixture.nativeElement.querySelector('button').click();
    expect(component.checked()).toBe(false);
  });

  it('should register and invoke touched callback when toggled', () => {
    const onTouched = vi.fn();
    component.registerOnTouched(onTouched);
    fixture.nativeElement.querySelector('button').click();
    expect(onTouched).toHaveBeenCalled();
  });
});
