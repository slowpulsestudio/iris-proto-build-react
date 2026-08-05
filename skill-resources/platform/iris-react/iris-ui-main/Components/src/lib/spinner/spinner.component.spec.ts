// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisSpinnerComponent } from './spinner.component';

describe('IrisSpinnerComponent', () => {
  let component: IrisSpinnerComponent;
  let fixture: ComponentFixture<IrisSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisSpinnerComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(IrisSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have role status on host', () => {
    expect(fixture.nativeElement.getAttribute('role')).toBe('status');
  });

  it('should set aria-label from default "Loading"', () => {
    expect(fixture.nativeElement.getAttribute('aria-label')).toBe('Loading');
  });

  it('should accept custom ariaLabel', () => {
    fixture.componentRef.setInput('ariaLabel', 'Processing');
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute('aria-label')).toBe('Processing');
  });

  it('should have aria-hidden on the svg', () => {
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
  });

  it('should render loop arc by default', () => {
    expect(fixture.nativeElement.querySelector('.iris-spinner__arc')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.iris-spinner__track')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.iris-spinner__progress')).toBeNull();
  });

  it('should render progress arc when scenario is completion', () => {
    fixture.componentRef.setInput('scenario', 'completion');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-spinner__progress')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.iris-spinner__arc')).toBeNull();
  });

  it('should set stroke-dasharray proportionally to progress', () => {
    fixture.componentRef.setInput('scenario', 'completion');
    fixture.componentRef.setInput('progress', 25);
    fixture.detectChanges();
    const progressArc = fixture.nativeElement.querySelector('.iris-spinner__progress');
    const dasharray = progressArc.getAttribute('stroke-dasharray');
    const filled = (25 / 100) * 2 * Math.PI * 9;
    expect(dasharray).toContain(filled.toString().slice(0, 5));
  });

  it('should clamp progress above 100 to 100', () => {
    fixture.componentRef.setInput('scenario', 'completion');
    fixture.componentRef.setInput('progress', 150);
    fixture.detectChanges();
    const dasharray = fixture.nativeElement.querySelector('.iris-spinner__progress').getAttribute('stroke-dasharray');
    const maxFilled = 2 * Math.PI * 9;
    expect(dasharray).toContain(maxFilled.toString().slice(0, 5));
  });

  it('should clamp progress below 0 to 0', () => {
    fixture.componentRef.setInput('scenario', 'completion');
    fixture.componentRef.setInput('progress', -20);
    fixture.detectChanges();
    const dasharray = fixture.nativeElement.querySelector('.iris-spinner__progress').getAttribute('stroke-dasharray');
    expect(dasharray).toContain('0 ');
  });

  it('should clamp progress between 91 and 99 to 90', () => {
    fixture.componentRef.setInput('scenario', 'completion');
    fixture.componentRef.setInput('progress', 95);
    fixture.detectChanges();
    const dasharray = fixture.nativeElement.querySelector('.iris-spinner__progress').getAttribute('stroke-dasharray');
    const filled90 = (90 / 100) * 2 * Math.PI * 9;
    expect(dasharray).toContain(filled90.toString().slice(0, 5));
  });

  it('should allow full circle at exactly 100', () => {
    fixture.componentRef.setInput('scenario', 'completion');
    fixture.componentRef.setInput('progress', 100);
    fixture.detectChanges();
    const dasharray = fixture.nativeElement.querySelector('.iris-spinner__progress').getAttribute('stroke-dasharray');
    const maxFilled = 2 * Math.PI * 9;
    expect(dasharray).toContain(maxFilled.toString().slice(0, 5));
  });

  it('should apply default size class', () => {
    expect(fixture.nativeElement.querySelector('.iris-spinner--default')).toBeTruthy();
  });

  it('should apply sm size class', () => {
    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-spinner--sm')).toBeTruthy();
  });

  it('should apply lg size class', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-spinner--lg')).toBeTruthy();
  });

  it('should apply loop animation class', () => {
    expect(fixture.nativeElement.querySelector('.iris-spinner--loop')).toBeTruthy();
  });

  it('should not apply loop class when scenario is completion', () => {
    fixture.componentRef.setInput('scenario', 'completion');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-spinner--loop')).toBeNull();
    expect(fixture.nativeElement.querySelector('.iris-spinner--completion')).toBeTruthy();
  });
});
