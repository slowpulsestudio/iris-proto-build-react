// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IRIS_FORM_FIELD } from '../form-field/form-field.token';
import { IrisTooltipDirective } from '../tooltip/tooltip.directive';
import { IrisLabelComponent } from './label.component';

@Component({
  standalone: true,
  imports: [IrisLabelComponent],
  template: `<iris-label
    [infoText]="infoText"
    [infoTooltipPosition]="infoTooltipPosition"
    [countValue]="countValue"
    [countMax]="countMax"
    >{{ text }}</iris-label
  >`,
})
class TestHostComponent {
  text = '';
  infoText = '';
  infoTooltipPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';
  countValue = 0;
  countMax = 0;
}

describe('IrisLabelComponent', () => {
  let host: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();
    host = TestBed.createComponent(TestHostComponent);
    host.detectChanges();
  });

  it('should create', () => {
    expect(host.componentInstance).toBeTruthy();
  });

  it('should project label text via ng-content', () => {
    host.componentInstance.text = 'Username';
    host.detectChanges();
    const labelText = host.nativeElement.querySelector('.iris-label__text');
    expect(labelText.textContent.trim()).toBe('Username');
  });

  it('should not show required indicator without a form field', () => {
    const requiredElement = host.nativeElement.querySelector('.iris-label__required');
    expect(requiredElement).toBeNull();
  });

  it('should show info icon and tooltip when infoText is provided', () => {
    host.componentInstance.infoText = 'Some helpful context';
    host.detectChanges();
    const infoIcon = host.nativeElement.querySelector('.iris-label__info-icon');
    expect(infoIcon).toBeTruthy();
  });

  it('should give info icon tabindex 0 for keyboard access', () => {
    host.componentInstance.infoText = 'Some helpful context';
    host.detectChanges();
    const infoIcon = host.nativeElement.querySelector('.iris-label__info-icon');
    expect(infoIcon.getAttribute('tabindex')).toBe('0');
  });

  it('should forward the configured tooltip position to the info icon', () => {
    host.componentInstance.infoText = 'Some helpful context';
    host.componentInstance.infoTooltipPosition = 'right';
    host.detectChanges();
    const tooltipDirective = host.debugElement
      .query(By.directive(IrisTooltipDirective))
      .injector.get(IrisTooltipDirective);
    expect(tooltipDirective.irisTooltipPosition()).toBe('right');
  });

  it('should not show info icon when infoText is empty', () => {
    const infoIcon = host.nativeElement.querySelector('.iris-label__info-icon');
    expect(infoIcon).toBeNull();
  });

  it('should show count when countMax is greater than zero', () => {
    host.componentInstance.countValue = 5;
    host.componentInstance.countMax = 100;
    host.detectChanges();
    const countElement = host.nativeElement.querySelector('.iris-label__count');
    expect(countElement).toBeTruthy();
    expect(countElement.textContent).toBe('5/100');
  });

  it('should hide count when countMax is zero', () => {
    const countElement = host.nativeElement.querySelector('.iris-label__count');
    expect(countElement).toBeNull();
  });
});

describe('IrisLabelComponent with required form field', () => {
  let fixture: ComponentFixture<IrisLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisLabelComponent],
      providers: [
        {
          provide: IRIS_FORM_FIELD,
          useValue: {
            showError: signal(false),
            isRequired: signal(true),
            countValue: signal(0),
            countMax: signal(0),
            activeDescriptionId: signal(null),
            labelId: 'iris-ff-test-label',
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(IrisLabelComponent);
    fixture.detectChanges();
  });

  it('should show required indicator with default English text', () => {
    const el = fixture.nativeElement.querySelector('.iris-label__required');
    expect(el).toBeTruthy();
    expect(el.textContent).toBe('(Required)');
  });

  it('should set id on label text span for aria-labelledby', () => {
    const textSpan = fixture.nativeElement.querySelector('.iris-label__text');
    expect(textSpan.getAttribute('id')).toBe('iris-ff-test-label');
  });

  it('should show localised required text when requiredText is overridden', () => {
    fixture.componentRef.setInput('requiredText', '(Kötelező)');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.iris-label__required');
    expect(el.textContent).toBe('(Kötelező)');
  });
});
