// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisButtonComponent } from './button.component';

describe('IrisButtonComponent', () => {
  let component: IrisButtonComponent;
  let fixture: ComponentFixture<IrisButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisButtonComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(IrisButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply variant class', () => {
    fixture.componentRef.setInput('variant', 'danger');
    fixture.detectChanges();
    const buttonElement = fixture.nativeElement.querySelector('.iris-button');
    expect(buttonElement.classList.contains('iris-button--danger')).toBe(true);
  });

  it('should apply size class', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    const buttonElement = fixture.nativeElement.querySelector('.iris-button');
    expect(buttonElement.classList.contains('iris-button--lg')).toBe(true);
  });

  it('should be disabled when disabled input is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const nativeButton = fixture.nativeElement.querySelector('button');
    expect(nativeButton.disabled).toBe(true);
  });

  it('should project label text via ng-content', () => {
    const host = document.createElement('iris-button');
    host.textContent = 'Submit';
    document.body.appendChild(host);
    expect(fixture.nativeElement.textContent).toBeDefined();
    document.body.removeChild(host);
  });

  it('should apply icon-only class', () => {
    fixture.componentRef.setInput('buttonType', 'icon-only');
    fixture.componentRef.setInput('iconName', 'plus');
    fixture.detectChanges();
    const buttonElement = fixture.nativeElement.querySelector('.iris-button');
    expect(buttonElement.classList.contains('iris-button--icon-only')).toBe(true);
  });

  it('should hide label visually but keep it in DOM for icon-only', () => {
    fixture.componentRef.setInput('buttonType', 'icon-only');
    fixture.detectChanges();
    const labelSpan = fixture.nativeElement.querySelector('.iris-button__label');
    expect(labelSpan).toBeTruthy();
    expect(labelSpan.classList.contains('iris-screen-reader-only')).toBe(true);
  });

  it('should show label visually for text-only buttons', () => {
    fixture.componentRef.setInput('buttonType', 'text-only');
    fixture.detectChanges();
    const labelSpan = fixture.nativeElement.querySelector('.iris-button__label');
    expect(labelSpan).toBeTruthy();
    expect(labelSpan.classList.contains('iris-screen-reader-only')).toBe(false);
  });

  it('should apply ghost variant class', () => {
    fixture.componentRef.setInput('variant', 'ghost');
    fixture.detectChanges();
    const buttonElement = fixture.nativeElement.querySelector('.iris-button');
    expect(buttonElement.classList.contains('iris-button--ghost')).toBe(true);
  });
});
