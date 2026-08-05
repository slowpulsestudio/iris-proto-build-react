// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisSubtextComponent } from './subtext.component';

describe('IrisSubtextComponent', () => {
  let fixture: ComponentFixture<IrisSubtextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [IrisSubtextComponent] }).compileComponents();
    fixture = TestBed.createComponent(IrisSubtextComponent);
  });

  it('should set aria-live="polite" for error type', () => {
    fixture.componentRef.setInput('type', 'error');
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector('.iris-subtext');
    expect(span.getAttribute('aria-live')).toBe('polite');
  });

  it('should not set aria-live for hint type', () => {
    fixture.componentRef.setInput('type', 'hint');
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector('.iris-subtext');
    expect(span.getAttribute('aria-live')).toBeNull();
  });
});
