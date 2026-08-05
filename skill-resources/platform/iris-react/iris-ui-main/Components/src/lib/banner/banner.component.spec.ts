// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisBannerComponent } from './banner.component';

describe('IrisBannerComponent', () => {
  let component: IrisBannerComponent;
  let fixture: ComponentFixture<IrisBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisBannerComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(IrisBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply type class', () => {
    fixture.componentRef.setInput('type', 'warning');
    fixture.detectChanges();
    const bannerElement = fixture.nativeElement.querySelector('.iris-banner');
    expect(bannerElement.classList.contains('iris-banner--warning')).toBe(true);
  });

  it('should apply colored class', () => {
    fixture.componentRef.setInput('colored', true);
    fixture.detectChanges();
    const bannerElement = fixture.nativeElement.querySelector('.iris-banner');
    expect(bannerElement.classList.contains('iris-banner--colored')).toBe(true);
  });

  it('should display title and supporting text', () => {
    fixture.componentRef.setInput('title', 'Alert');
    fixture.componentRef.setInput('supportingText', 'Details here');
    fixture.detectChanges();
    const titleEl = fixture.nativeElement.querySelector('.iris-banner__title');
    expect(titleEl.textContent).toContain('Alert');
    expect(titleEl.querySelector('.iris-screen-reader-only').textContent.trim()).toBe('Info:');
    expect(fixture.nativeElement.querySelector('.iris-banner__supporting-text').textContent).toBe('Details here');
  });

  it('should dismiss when dismiss button clicked', () => {
    const spy = vi.spyOn(component.dismissed, 'emit');
    fixture.nativeElement.querySelector('.iris-banner__dismiss').click();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.iris-banner')).toBeNull();
  });

  it('should show actions when showActions is true', () => {
    fixture.componentRef.setInput('showActions', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-banner__actions')).toBeTruthy();
  });

  it('should apply success type class', () => {
    fixture.componentRef.setInput('type', 'success');
    fixture.detectChanges();
    const bannerElement = fixture.nativeElement.querySelector('.iris-banner');
    expect(bannerElement.classList.contains('iris-banner--success')).toBe(true);
  });

  it('should not render dismiss button when dismissable is false', () => {
    fixture.componentRef.setInput('dismissable', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-banner__dismiss')).toBeNull();
  });

  it('should not render actions when showActions is false', () => {
    fixture.componentRef.setInput('showActions', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-banner__actions')).toBeNull();
  });

  it('should not render supporting text when it is empty', () => {
    fixture.componentRef.setInput('supportingText', '');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-banner__supporting-text')).toBeNull();
  });

  it('should use role="alert" for error type', () => {
    fixture.componentRef.setInput('type', 'error');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-banner').getAttribute('role')).toBe('alert');
  });

  it('should use role="alert" for warning type', () => {
    fixture.componentRef.setInput('type', 'warning');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-banner').getAttribute('role')).toBe('alert');
  });

  it('should use role="status" for info type', () => {
    fixture.componentRef.setInput('type', 'info');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-banner').getAttribute('role')).toBe('status');
  });

  it('should use default aria-label "Dismiss" on dismiss button', () => {
    const btn = fixture.nativeElement.querySelector('.iris-banner__dismiss');
    expect(btn.getAttribute('aria-label')).toBe('Dismiss');
  });

  it('should use custom dismissAriaLabel on dismiss button', () => {
    fixture.componentRef.setInput('dismissAriaLabel', 'Fermer');
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.iris-banner__dismiss');
    expect(btn.getAttribute('aria-label')).toBe('Fermer');
  });
});
