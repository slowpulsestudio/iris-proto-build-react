// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisLinkComponent } from './link.component';

describe('IrisLinkComponent', () => {
  let component: IrisLinkComponent;
  let fixture: ComponentFixture<IrisLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisLinkComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(IrisLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display text', () => {
    fixture.componentRef.setInput('text', 'Click here');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('Click here');
  });

  it('should apply large size', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    const linkElement = fixture.nativeElement.querySelector('.iris-link');
    expect(linkElement.classList.contains('iris-link--lg')).toBe(true);
  });

  it('should apply disabled class', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const linkElement = fixture.nativeElement.querySelector('.iris-link');
    expect(linkElement.classList.contains('iris-link--disabled')).toBe(true);
    expect(linkElement.getAttribute('aria-disabled')).toBe('true');
  });

  it('should set href', () => {
    fixture.componentRef.setInput('href', 'https://example.com');
    fixture.detectChanges();
    const anchorElement = fixture.nativeElement.querySelector('a');
    expect(anchorElement.getAttribute('href')).toBe('https://example.com');
  });

  it('should fall back to href as display text when text is empty', () => {
    fixture.componentRef.setInput('href', 'https://example.com');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('https://example.com');
  });

  it('should set tabindex -1 when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a').getAttribute('tabindex')).toBe('-1');
  });

  it('should remove href when disabled', () => {
    fixture.componentRef.setInput('href', 'https://example.com');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a').getAttribute('href')).toBeNull();
  });
});
