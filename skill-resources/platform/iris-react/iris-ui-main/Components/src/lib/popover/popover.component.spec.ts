// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { Component, TemplateRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisPopoverComponent } from './popover.component';

@Component({
  template: `
    <ng-template #template><span class="slot-content">content</span></ng-template>
    <iris-popover [contentTemplate]="template" [padding]="padding" />
  `,
  imports: [IrisPopoverComponent],
})
class TestHostComponent {
  readonly template = viewChild.required<TemplateRef<unknown>>('template');
  padding: 'xs' | 'sm' | 'md' | 'lg' = 'lg';
}

describe('IrisPopoverComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.nativeElement.querySelector('iris-popover')).toBeTruthy();
  });

  it('should render the popover container', () => {
    expect(fixture.nativeElement.querySelector('.iris-popover')).toBeTruthy();
  });

  it('should render the provided template content', () => {
    expect(fixture.nativeElement.querySelector('.slot-content')).toBeTruthy();
  });

  it('should apply the lg padding class by default', () => {
    const popoverElement = fixture.nativeElement.querySelector('.iris-popover');
    expect(popoverElement.classList.contains('iris-popover--lg')).toBe(true);
  });

  it('should apply padding class when changed', () => {
    fixture.componentInstance.padding = 'sm';
    fixture.detectChanges();
    const popoverElement = fixture.nativeElement.querySelector('.iris-popover');
    expect(popoverElement.classList.contains('iris-popover--sm')).toBe(true);
  });

  it('should not set aria-label when ariaLabel is empty', () => {
    expect(fixture.nativeElement.querySelector('.iris-popover').getAttribute('aria-label')).toBeNull();
  });
});
