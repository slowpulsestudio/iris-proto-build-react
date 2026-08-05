// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisButtonSplitComponent } from './button-split.component';

describe('IrisButtonSplitComponent', () => {
  let component: IrisButtonSplitComponent;
  let fixture: ComponentFixture<IrisButtonSplitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisButtonSplitComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(IrisButtonSplitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply primary variant class by default', () => {
    const container = fixture.nativeElement.querySelector('.iris-button-split');
    expect(container.classList.contains('iris-button-split--primary')).toBe(true);
  });

  it('should apply ghost variant class', () => {
    fixture.componentRef.setInput('variant', 'ghost');
    fixture.detectChanges();
    const container = fixture.nativeElement.querySelector('.iris-button-split');
    expect(container.classList.contains('iris-button-split--ghost')).toBe(true);
  });

  it('should display label text', () => {
    fixture.componentRef.setInput('label', 'Save');
    fixture.detectChanges();
    const labelElement = fixture.nativeElement.querySelector('.iris-button-split__label');
    expect(labelElement.textContent).toContain('Save');
  });

  it('should disable both buttons when disabled is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const actionButton = fixture.nativeElement.querySelector('.iris-button-split__action');
    const toggleButton = fixture.nativeElement.querySelector('.iris-button-split__toggle');
    expect(actionButton.disabled).toBe(true);
    expect(toggleButton.disabled).toBe(true);
  });

  it('should emit primaryClick when action button is clicked', () => {
    const primaryClickSpy = vi.fn();
    component.primaryClick.subscribe(primaryClickSpy);
    const actionButton = fixture.nativeElement.querySelector('.iris-button-split__action');
    actionButton.click();
    expect(primaryClickSpy).toHaveBeenCalled();
  });

  it('should not emit primaryClick when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const primaryClickSpy = vi.fn();
    component.primaryClick.subscribe(primaryClickSpy);
    const actionButton = fixture.nativeElement.querySelector('.iris-button-split__action');
    actionButton.click();
    expect(primaryClickSpy).not.toHaveBeenCalled();
  });

  it('should use default aria-label "More options" on toggle button', () => {
    const toggleButton = fixture.nativeElement.querySelector('.iris-button-split__toggle');
    expect(toggleButton.getAttribute('aria-label')).toBe('More options');
  });

  it('should use custom moreOptionsAriaLabel on toggle button', () => {
    fixture.componentRef.setInput('moreOptionsAriaLabel', 'Más opciones');
    fixture.detectChanges();
    const toggleButton = fixture.nativeElement.querySelector('.iris-button-split__toggle');
    expect(toggleButton.getAttribute('aria-label')).toBe('Más opciones');
  });
});
