// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisSidesheetComponent } from './sidesheet.component';

describe('IrisSidesheetComponent', () => {
  let component: IrisSidesheetComponent;
  let fixture: ComponentFixture<IrisSidesheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisSidesheetComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(IrisSidesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the sidesheet panel', () => {
    const aside = fixture.nativeElement.querySelector('.iris-sidesheet');
    expect(aside).toBeTruthy();
  });

  it('should display title text', () => {
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.detectChanges();
    const titleElement = fixture.nativeElement.querySelector('.iris-sidesheet__title');
    expect(titleElement.textContent).toContain('Test Title');
  });

  it('should display subtitle when provided', () => {
    fixture.componentRef.setInput('subtitle', 'Test Subtitle');
    fixture.detectChanges();
    const subtitleElement = fixture.nativeElement.querySelector('.iris-sidesheet__subtitle');
    expect(subtitleElement.textContent).toContain('Test Subtitle');
  });

  it('should not display subtitle when empty', () => {
    fixture.componentRef.setInput('subtitle', '');
    fixture.detectChanges();
    const subtitleElement = fixture.nativeElement.querySelector('.iris-sidesheet__subtitle');
    expect(subtitleElement).toBeNull();
  });

  it('should show close button when dismissable is true', () => {
    fixture.componentRef.setInput('dismissable', true);
    fixture.detectChanges();
    const closeButton = fixture.nativeElement.querySelector('[aria-label="Close"]');
    expect(closeButton).toBeTruthy();
  });

  it('should not show close button when dismissable is false', () => {
    fixture.componentRef.setInput('dismissable', false);
    fixture.detectChanges();
    const closeButton = fixture.nativeElement.querySelector('[aria-label="Close"]');
    expect(closeButton).toBeNull();
  });

  it('should emit closed when close button is clicked', () => {
    fixture.componentRef.setInput('dismissable', true);
    fixture.detectChanges();
    const closedSpy = vi.spyOn(component.closed, 'emit');
    const closeButton = fixture.nativeElement.querySelector('[aria-label="Close"]');
    closeButton.click();
    expect(closedSpy).toHaveBeenCalled();
  });

  it('should show title icon when titleIcon is set', () => {
    fixture.componentRef.setInput('titleIcon', 'user');
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('.iris-sidesheet__title-icon');
    expect(icon).toBeTruthy();
  });

  it('should not show title icon when titleIcon is empty', () => {
    fixture.componentRef.setInput('titleIcon', '');
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('.iris-sidesheet__title-icon');
    expect(icon).toBeNull();
  });

  it('should not emit closed when onBackdropClick called with dismissable false', () => {
    fixture.componentRef.setInput('dismissable', false);
    fixture.componentRef.setInput('closeOnBackdropClick', true);
    fixture.detectChanges();
    const closedSpy = vi.spyOn(component.closed, 'emit');
    component.onBackdropClick();
    expect(closedSpy).not.toHaveBeenCalled();
  });

  it('should not emit closed when onBackdropClick called with closeOnBackdropClick false', () => {
    fixture.componentRef.setInput('dismissable', true);
    fixture.componentRef.setInput('closeOnBackdropClick', false);
    fixture.detectChanges();
    const closedSpy = vi.spyOn(component.closed, 'emit');
    component.onBackdropClick();
    expect(closedSpy).not.toHaveBeenCalled();
  });

  it('should emit closed when onBackdropClick called with dismissable and closeOnBackdropClick true', () => {
    fixture.componentRef.setInput('dismissable', true);
    fixture.componentRef.setInput('closeOnBackdropClick', true);
    fixture.detectChanges();
    const closedSpy = vi.spyOn(component.closed, 'emit');
    component.onBackdropClick();
    expect(closedSpy).toHaveBeenCalled();
  });

  it('should emit closed on Escape keydown when dismissable and closeOnEscape true', () => {
    fixture.componentRef.setInput('dismissable', true);
    fixture.componentRef.setInput('closeOnEscape', true);
    fixture.detectChanges();
    const closedSpy = vi.spyOn(component.closed, 'emit');
    const aside = fixture.nativeElement.querySelector('.iris-sidesheet');
    aside.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(closedSpy).toHaveBeenCalled();
  });

  it('should not emit closed on Escape when dismissable false', () => {
    fixture.componentRef.setInput('dismissable', false);
    fixture.detectChanges();
    const closedSpy = vi.spyOn(component.closed, 'emit');
    const aside = fixture.nativeElement.querySelector('.iris-sidesheet');
    aside.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(closedSpy).not.toHaveBeenCalled();
  });

  it('should not emit closed on Escape when closeOnEscape false', () => {
    fixture.componentRef.setInput('dismissable', true);
    fixture.componentRef.setInput('closeOnEscape', false);
    fixture.detectChanges();
    const closedSpy = vi.spyOn(component.closed, 'emit');
    const aside = fixture.nativeElement.querySelector('.iris-sidesheet');
    aside.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(closedSpy).not.toHaveBeenCalled();
  });

  it('should show maximize button when enableMaximizeToggle is true', () => {
    fixture.componentRef.setInput('enableMaximizeToggle', true);
    fixture.detectChanges();
    const maximizeButton = fixture.nativeElement.querySelector('[aria-label="Maximize"]');
    expect(maximizeButton).toBeTruthy();
  });

  it('should not show maximize button when enableMaximizeToggle is false', () => {
    fixture.componentRef.setInput('enableMaximizeToggle', false);
    fixture.detectChanges();
    const maximizeButton = fixture.nativeElement.querySelector('[aria-label="Maximize"]');
    expect(maximizeButton).toBeNull();
  });

  it('should emit maximizedChange when maximize button is clicked', () => {
    fixture.componentRef.setInput('enableMaximizeToggle', true);
    fixture.componentRef.setInput('maximized', false);
    fixture.detectChanges();
    const maximizedChangeSpy = vi.spyOn(component.maximizedChange, 'emit');
    const maximizeButton = fixture.nativeElement.querySelector('[aria-label="Maximize"]');
    maximizeButton.click();
    expect(maximizedChangeSpy).toHaveBeenCalledWith(true);
  });

  it('should show restore label when maximized is true', () => {
    fixture.componentRef.setInput('enableMaximizeToggle', true);
    fixture.componentRef.setInput('maximized', true);
    fixture.detectChanges();
    const restoreButton = fixture.nativeElement.querySelector('[aria-label="Restore"]');
    expect(restoreButton).toBeTruthy();
  });

  it('should apply maximized class when maximized is true', () => {
    fixture.componentRef.setInput('maximized', true);
    fixture.detectChanges();
    const aside = fixture.nativeElement.querySelector('.iris-sidesheet--maximized');
    expect(aside).toBeTruthy();
  });

  it('should use role="dialog" and aria-modal="true"', () => {
    const aside = fixture.nativeElement.querySelector('.iris-sidesheet');
    expect(aside.getAttribute('role')).toBe('dialog');
    expect(aside.getAttribute('aria-modal')).toBe('true');
  });

  it('should set aria-label from title', () => {
    fixture.componentRef.setInput('title', 'My Sheet');
    fixture.detectChanges();
    const aside = fixture.nativeElement.querySelector('.iris-sidesheet');
    expect(aside.getAttribute('aria-label')).toBe('My Sheet');
  });

  it('should not set aria-label when title is empty', () => {
    fixture.componentRef.setInput('title', '');
    fixture.detectChanges();
    const aside = fixture.nativeElement.querySelector('.iris-sidesheet');
    expect(aside.getAttribute('aria-label')).toBeNull();
  });

  it('should use custom closeAriaLabel on close button', () => {
    fixture.componentRef.setInput('dismissable', true);
    fixture.componentRef.setInput('closeAriaLabel', 'Schließen');
    fixture.detectChanges();
    const closeButton = fixture.nativeElement.querySelector('.iris-sidesheet__action-button[aria-label="Schließen"]');
    expect(closeButton).toBeTruthy();
  });

  it('should use custom maximizeAriaLabel and restoreAriaLabel', () => {
    fixture.componentRef.setInput('enableMaximizeToggle', true);
    fixture.componentRef.setInput('maximized', false);
    fixture.componentRef.setInput('maximizeAriaLabel', 'Maximieren');
    fixture.componentRef.setInput('restoreAriaLabel', 'Wiederherstellen');
    fixture.detectChanges();
    const maximizeButton = fixture.nativeElement.querySelector('[aria-label="Maximieren"]');
    expect(maximizeButton).toBeTruthy();
  });
});
