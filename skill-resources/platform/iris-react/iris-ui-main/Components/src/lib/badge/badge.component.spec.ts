// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisBadgeComponent } from './badge.component';

describe('IrisBadgeComponent', () => {
  let component: IrisBadgeComponent;
  let fixture: ComponentFixture<IrisBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisBadgeComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(IrisBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display text', () => {
    fixture.componentRef.setInput('text', 'New');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('New');
  });

  it('should apply type class', () => {
    fixture.componentRef.setInput('type', 'error');
    fixture.detectChanges();
    const badgeElement = fixture.nativeElement.querySelector('.iris-badge');
    expect(badgeElement.classList.contains('iris-badge--error')).toBe(true);
  });

  it('should apply strong class', () => {
    fixture.componentRef.setInput('strong', true);
    fixture.detectChanges();
    const badgeElement = fixture.nativeElement.querySelector('.iris-badge');
    expect(badgeElement.classList.contains('iris-badge--strong')).toBe(true);
  });

  it('should render icon when iconName is set', () => {
    fixture.componentRef.setInput('iconName', 'check');
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('.iris-badge__icon');
    expect(icon).toBeTruthy();
  });

  it('should not render icon when iconName is empty', () => {
    fixture.componentRef.setInput('iconName', '');
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('.iris-badge__icon');
    expect(icon).toBeNull();
  });
});
