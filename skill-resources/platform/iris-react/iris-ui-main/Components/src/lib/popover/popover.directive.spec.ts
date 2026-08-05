// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, TemplateRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IrisPopoverDirective } from './popover.directive';

@Component({
  template: `
    <ng-template #popoverContent>
      <div class="test-content">Popover content</div>
    </ng-template>
    <button
      [irisPopover]="popoverContent"
      [irisPopoverPadding]="padding"
      [irisPopoverPosition]="position"
      #popover="irisPopover"
      (click)="popover.toggle()"
    >
      Open
    </button>
  `,
  imports: [IrisPopoverDirective],
})
class TestHostComponent {
  readonly popoverTemplate = viewChild.required<TemplateRef<unknown>>('popoverContent');
  padding: 'xs' | 'sm' | 'md' | 'lg' = 'lg';
  position: 'bottom-center' | 'bottom-start' | 'bottom-end' | 'top-center' | 'top-start' | 'top-end' = 'bottom-center';
  openedCount = 0;
  closedCount = 0;
}

describe('IrisPopoverDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let triggerElement: HTMLElement;
  let overlayContainerElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    triggerElement = fixture.nativeElement.querySelector('button');
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should set aria-haspopup="dialog" on trigger', () => {
    expect(triggerElement.getAttribute('aria-haspopup')).toBe('dialog');
  });

  it('should set aria-expanded to false when closed', () => {
    expect(triggerElement.getAttribute('aria-expanded')).toBe('false');
  });

  it('should open popover on toggle', () => {
    triggerElement.click();
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('.iris-popover')).toBeTruthy();
  });

  it('should render provided template content inside popover', () => {
    triggerElement.click();
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('.test-content')).toBeTruthy();
  });

  it('should set aria-expanded to true when open', () => {
    triggerElement.click();
    fixture.detectChanges();
    expect(triggerElement.getAttribute('aria-expanded')).toBe('true');
  });

  it('should set aria-controls on trigger when open', () => {
    triggerElement.click();
    fixture.detectChanges();
    expect(triggerElement.getAttribute('aria-controls')).toMatch(/^iris-popover-\d+$/);
  });

  it('should close popover on second toggle', () => {
    triggerElement.click();
    fixture.detectChanges();
    triggerElement.click();
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('.iris-popover')).toBeNull();
  });

  it('should set aria-expanded to false after close', () => {
    triggerElement.click();
    fixture.detectChanges();
    triggerElement.click();
    fixture.detectChanges();
    expect(triggerElement.getAttribute('aria-expanded')).toBe('false');
  });

  it('should remove aria-controls after close', () => {
    triggerElement.click();
    fixture.detectChanges();
    triggerElement.click();
    fixture.detectChanges();
    expect(triggerElement.getAttribute('aria-controls')).toBeNull();
  });

  it('should close popover on Escape key', () => {
    triggerElement.click();
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('.iris-popover')).toBeNull();
  });

  it('should apply the irisPopoverPadding input to the panel', () => {
    fixture.componentInstance.padding = 'sm';
    fixture.detectChanges();
    triggerElement.click();
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('.iris-popover--sm')).toBeTruthy();
  });

  it('should not open a second overlay when open() is called while already open', () => {
    triggerElement.click();
    fixture.detectChanges();
    const directive = fixture.debugElement.query(By.directive(IrisPopoverDirective)).injector.get(IrisPopoverDirective);
    directive.open();
    fixture.detectChanges();
    expect(overlayContainerElement.querySelectorAll('.iris-popover').length).toBe(1);
  });
});
