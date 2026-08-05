// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisTagComponent } from './tag.component';

describe('IrisTagComponent', () => {
  let component: IrisTagComponent;
  let fixture: ComponentFixture<IrisTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisTagComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(IrisTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display text', () => {
    fixture.componentRef.setInput('text', 'Angular');
    fixture.detectChanges();
    const textEl = fixture.nativeElement.querySelector('.iris-tag__text');
    expect(textEl.textContent.trim()).toBe('Angular');
  });

  it('should not have tabindex on text span', () => {
    fixture.detectChanges();
    const textEl = fixture.nativeElement.querySelector('.iris-tag__text');
    expect(textEl.getAttribute('tabindex')).toBeNull();
  });

  it('should show remove button when removable', () => {
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.iris-tag__action');
    expect(btn).toBeTruthy();
  });

  it('should hide remove button when not removable', () => {
    fixture.componentRef.setInput('removable', false);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.iris-tag__action');
    expect(btn).toBeNull();
  });

  it('should emit remove event on button click', () => {
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();
    let emitted = false;
    component.removed.subscribe(() => (emitted = true));
    const btn = fixture.nativeElement.querySelector('.iris-tag__action');
    btn.click();
    expect(emitted).toBe(true);
  });

  it('should emit remove event on Enter key on remove button', () => {
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();
    let emitted = false;
    component.removed.subscribe(() => (emitted = true));
    const btn = fixture.nativeElement.querySelector('.iris-tag__action');
    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(emitted).toBe(true);
  });

  it('should emit remove event on Space key on remove button', () => {
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();
    let emitted = false;
    component.removed.subscribe(() => (emitted = true));
    const btn = fixture.nativeElement.querySelector('.iris-tag__action');
    btn.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(emitted).toBe(true);
  });

  it('should not emit remove event on other key on remove button', () => {
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();
    let emitted = false;
    component.removed.subscribe(() => (emitted = true));
    const btn = fixture.nativeElement.querySelector('.iris-tag__action');
    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(emitted).toBe(false);
  });

  it('should use default aria-label "Remove" on remove button', () => {
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.iris-tag__action');
    expect(btn.getAttribute('aria-label')).toBe('Remove');
  });

  it('should use custom removeAriaLabel on remove button', () => {
    fixture.componentRef.setInput('removable', true);
    fixture.componentRef.setInput('removeAriaLabel', 'Supprimer');
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.iris-tag__action');
    expect(btn.getAttribute('aria-label')).toBe('Supprimer');
  });
});
