// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisIconComponent } from './icon.component';

describe('IrisIconComponent', () => {
  let component: IrisIconComponent;
  let fixture: ComponentFixture<IrisIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IrisIconComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('name', 'Bell');
    fixture.componentRef.setInput('label', 'Bell');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render svg content for a known icon name', () => {
    const spanElement: HTMLElement = fixture.nativeElement.querySelector('.iris-icon');
    expect(spanElement.innerHTML).toContain('<svg');
  });

  it('should use the label as aria-label', () => {
    const spanElement: HTMLElement = fixture.nativeElement.querySelector('.iris-icon');
    expect(spanElement.getAttribute('aria-label')).toBe('Bell');
    expect(spanElement.getAttribute('role')).toBe('img');
    expect(spanElement.getAttribute('aria-hidden')).toBeNull();
  });

  it('should fall back to icon name as aria-label when label is empty string', () => {
    fixture.componentRef.setInput('label', '');
    fixture.detectChanges();
    const spanElement: HTMLElement = fixture.nativeElement.querySelector('.iris-icon');
    expect(spanElement.getAttribute('aria-label')).toBe('Bell');
    expect(spanElement.getAttribute('role')).toBe('img');
    expect(spanElement.getAttribute('aria-hidden')).toBeNull();
  });

  it('should be decorative (aria-hidden) when decorative is true', () => {
    fixture.componentRef.setInput('decorative', true);
    fixture.detectChanges();
    const spanElement: HTMLElement = fixture.nativeElement.querySelector('.iris-icon');
    expect(spanElement.getAttribute('aria-hidden')).toBe('true');
    expect(spanElement.getAttribute('role')).toBeNull();
    expect(spanElement.getAttribute('aria-label')).toBeNull();
  });

  it('should set aria-label and role when label is provided', () => {
    fixture.componentRef.setInput('label', 'Notifications');
    fixture.detectChanges();
    const spanElement: HTMLElement = fixture.nativeElement.querySelector('.iris-icon');
    expect(spanElement.getAttribute('aria-label')).toBe('Notifications');
    expect(spanElement.getAttribute('role')).toBe('img');
    expect(spanElement.getAttribute('aria-hidden')).toBeNull();
  });

  it('should apply size as CSS custom property', () => {
    fixture.componentRef.setInput('size', 24);
    fixture.detectChanges();
    const spanElement: HTMLElement = fixture.nativeElement.querySelector('.iris-icon');
    expect(spanElement.style.getPropertyValue('--iris-icon-size')).toBe('24px');
  });

  it('should apply stroke width 1.5 for 16px size', () => {
    fixture.componentRef.setInput('size', 16);
    fixture.detectChanges();
    const spanElement: HTMLElement = fixture.nativeElement.querySelector('.iris-icon');
    expect(spanElement.style.getPropertyValue('--iris-icon-stroke-width')).toBe('1.5');
  });

  it('should apply stroke width 1 for 20px size', () => {
    fixture.componentRef.setInput('size', 20);
    fixture.detectChanges();
    const spanElement: HTMLElement = fixture.nativeElement.querySelector('.iris-icon');
    expect(spanElement.style.getPropertyValue('--iris-icon-stroke-width')).toBe('1');
  });

  it('should render nothing for an unknown icon name', () => {
    fixture.componentRef.setInput('name', 'NonExistentIcon12345');
    fixture.detectChanges();
    const spanElement: HTMLElement = fixture.nativeElement.querySelector('.iris-icon');
    expect(spanElement.innerHTML.trim()).toBe('');
  });
});
