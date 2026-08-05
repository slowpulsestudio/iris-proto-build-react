// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { IrisTooltipDirective } from './tooltip.directive';

@Component({
  template: `<button
    [irisTooltip]="tooltipText"
    [irisTooltipShortcut]="shortcut"
    [irisTooltipPosition]="position"
    [irisTooltipDisabled]="disabled"
  >
    Hover me
  </button>`,
  imports: [IrisTooltipDirective],
})
class TestHostComponent {
  tooltipText = 'Save changes';
  shortcut: string[] = [];
  position: 'top' | 'bottom' | 'left' | 'right' = 'top';
  disabled = false;
}

describe('IrisTooltipDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let triggerElement: HTMLElement;
  let overlayContainerElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();

    triggerElement = fixture.nativeElement.querySelector('button');
  });

  it('should create', () => {
    expect(hostComponent).toBeTruthy();
  });

  it('should show tooltip on mouseenter', () => {
    triggerElement.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('.iris-tooltip')).toBeTruthy();
  });

  it('should hide tooltip on mouseleave', () => {
    triggerElement.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    triggerElement.dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('.iris-tooltip')).toBeNull();
  });

  it('should not show tooltip when disabled', () => {
    hostComponent.disabled = true;
    fixture.detectChanges();
    triggerElement.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('.iris-tooltip')).toBeNull();
  });

  it('should set aria-describedby on trigger when shown', () => {
    triggerElement.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(triggerElement.getAttribute('aria-describedby')).toMatch(/^iris-tooltip-\d+$/);
  });

  it('should remove aria-describedby from trigger when hidden', () => {
    triggerElement.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    triggerElement.dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    expect(triggerElement.getAttribute('aria-describedby')).toBeNull();
  });

  it('should display the tooltip text', () => {
    triggerElement.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    const tooltipText = overlayContainerElement.querySelector('.iris-tooltip__text')?.textContent;
    expect(tooltipText).toBe('Save changes');
  });

  it('should clean up overlay on directive destroy', () => {
    triggerElement.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('.iris-tooltip')).toBeTruthy();
    fixture.destroy();
    expect(overlayContainerElement.querySelector('.iris-tooltip')).toBeNull();
  });
});
