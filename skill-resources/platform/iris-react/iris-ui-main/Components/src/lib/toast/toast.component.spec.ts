// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisToastComponent } from './toast.component';

describe('IrisToastComponent', () => {
  let component: IrisToastComponent;
  let fixture: ComponentFixture<IrisToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisToastComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(IrisToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply type class for warning', () => {
    fixture.componentRef.setInput('type', 'warning');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-toast').classList.contains('iris-toast--warning')).toBe(true);
  });

  it('should apply type class for error', () => {
    fixture.componentRef.setInput('type', 'error');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-toast').classList.contains('iris-toast--error')).toBe(true);
  });

  it('should apply type class for success', () => {
    fixture.componentRef.setInput('type', 'success');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-toast').classList.contains('iris-toast--success')).toBe(true);
  });

  it('should display title and supporting text', () => {
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.componentRef.setInput('supportingText', 'Supporting details');
    fixture.detectChanges();
    const titleElement = fixture.nativeElement.querySelector('.iris-toast__title');
    expect(titleElement.textContent).toContain('Test Title');
    expect(titleElement.querySelector('.iris-screen-reader-only').textContent.trim()).toBe('Info:');
    expect(fixture.nativeElement.querySelector('.iris-toast__supporting-text').textContent).toBe('Supporting details');
  });

  it('should not render supporting text when empty', () => {
    fixture.componentRef.setInput('supportingText', '');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-toast__supporting-text')).toBeNull();
  });

  it('should emit dismissed when dismiss button clicked', () => {
    const spy = vi.spyOn(component.dismissed, 'emit');
    fixture.nativeElement.querySelector('.iris-toast__dismiss').click();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
  });

  it('should not render dismiss button when dismissible is false', () => {
    fixture.componentRef.setInput('dismissible', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-toast__dismiss')).toBeNull();
  });

  it('should render action buttons when labels are set', () => {
    fixture.componentRef.setInput('primaryActionLabel', 'View');
    fixture.componentRef.setInput('secondaryActionLabel', 'Dismiss');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-toast__action--primary')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.iris-toast__action--secondary')).toBeTruthy();
  });

  it('should not render action buttons when labels are empty strings', () => {
    fixture.componentRef.setInput('primaryActionLabel', '');
    fixture.componentRef.setInput('secondaryActionLabel', '');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-toast__actions')).toBeNull();
  });

  it('should render only the primary button when secondary label is empty', () => {
    fixture.componentRef.setInput('primaryActionLabel', 'View');
    fixture.componentRef.setInput('secondaryActionLabel', '');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-toast__action--primary')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.iris-toast__action--secondary')).toBeNull();
  });

  it('should render only the secondary button without a primary action', () => {
    fixture.componentRef.setInput('primaryActionLabel', '');
    fixture.componentRef.setInput('secondaryActionLabel', 'Cancel');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-toast__action--primary')).toBeNull();
    expect(fixture.nativeElement.querySelector('.iris-toast__action--secondary')).toBeTruthy();
  });

  it('should always render the type icon', () => {
    expect(fixture.nativeElement.querySelector('.iris-toast__icon')).toBeTruthy();
  });

  it('should emit primaryAction when primary button clicked', () => {
    fixture.componentRef.setInput('primaryActionLabel', 'View');
    fixture.detectChanges();
    const spy = vi.spyOn(component.primaryAction, 'emit');
    fixture.nativeElement.querySelector('.iris-toast__action--primary').click();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit secondaryAction when secondary button clicked', () => {
    fixture.componentRef.setInput('primaryActionLabel', 'View');
    fixture.componentRef.setInput('secondaryActionLabel', 'Cancel');
    fixture.detectChanges();
    const spy = vi.spyOn(component.secondaryAction, 'emit');
    fixture.nativeElement.querySelector('.iris-toast__action--secondary').click();
    expect(spy).toHaveBeenCalled();
  });

  it('should use default aria-label "Dismiss" on dismiss button', () => {
    expect(fixture.nativeElement.querySelector('.iris-toast__dismiss').getAttribute('aria-label')).toBe('Dismiss');
  });

  it('should use custom dismissAriaLabel on dismiss button', () => {
    fixture.componentRef.setInput('dismissAriaLabel', 'Chiudi');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-toast__dismiss').getAttribute('aria-label')).toBe('Chiudi');
  });

  it('should use role="status" for info type', () => {
    fixture.componentRef.setInput('type', 'info');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-toast').getAttribute('role')).toBe('status');
  });

  it('should use role="status" for success type', () => {
    fixture.componentRef.setInput('type', 'success');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-toast').getAttribute('role')).toBe('status');
  });

  it('should use role="alert" for warning type', () => {
    fixture.componentRef.setInput('type', 'warning');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-toast').getAttribute('role')).toBe('alert');
  });

  it('should use role="alert" for error type', () => {
    fixture.componentRef.setInput('type', 'error');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-toast').getAttribute('role')).toBe('alert');
  });

  it('should have aria-atomic="true"', () => {
    expect(fixture.nativeElement.querySelector('.iris-toast').getAttribute('aria-atomic')).toBe('true');
  });

  it('should use localizable type labels in the screen-reader prefix', () => {
    fixture.componentRef.setInput('type', 'error');
    fixture.componentRef.setInput('errorAriaLabel', 'Erreur');
    fixture.detectChanges();
    const srLabel = fixture.nativeElement.querySelector('.iris-screen-reader-only');
    expect(srLabel.textContent.trim()).toBe('Erreur:');
  });
});
