// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisButtonComponent } from '../button/button.component';
import { IrisButtonGroupComponent } from './button-group.component';
import { ButtonGroupSize } from './button-group.model';

describe('IrisButtonGroupComponent', () => {
  let component: IrisButtonGroupComponent;
  let fixture: ComponentFixture<IrisButtonGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisButtonGroupComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(IrisButtonGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply large size class', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    const buttonGroupElement = fixture.nativeElement.querySelector('.iris-button-group');
    expect(buttonGroupElement.classList.contains('iris-button-group--lg')).toBe(true);
  });

  it('should have role group', () => {
    const groupElement = fixture.nativeElement.querySelector('[role="group"]');
    expect(groupElement).toBeTruthy();
  });

  it('should not set aria-label when ariaLabel is empty', () => {
    const groupElement = fixture.nativeElement.querySelector('[role="group"]');
    expect(groupElement.getAttribute('aria-label')).toBeNull();
  });

  it('should set aria-label when ariaLabel is provided', () => {
    fixture.componentRef.setInput('ariaLabel', 'Primary actions');
    fixture.detectChanges();
    const groupElement = fixture.nativeElement.querySelector('[role="group"]');
    expect(groupElement.getAttribute('aria-label')).toBe('Primary actions');
  });

  it('should apply reverse class when direction is reverse', () => {
    fixture.componentRef.setInput('direction', 'reverse');
    fixture.detectChanges();
    const buttonGroupElement = fixture.nativeElement.querySelector('.iris-button-group');
    expect(buttonGroupElement.classList.contains('iris-button-group--reverse')).toBe(true);
  });
});

@Component({
  standalone: true,
  imports: [IrisButtonGroupComponent, IrisButtonComponent],
  template: `
    <iris-button-group [size]="size">
      <iris-button label="Primary"></iris-button>
      <iris-button label="Secondary"></iris-button>
    </iris-button-group>
  `,
})
class ButtonGroupHostComponent {
  size: ButtonGroupSize = 'lg';
}

describe('IrisButtonGroupComponent size propagation', () => {
  let hostFixture: ComponentFixture<ButtonGroupHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ButtonGroupHostComponent] }).compileComponents();
    hostFixture = TestBed.createComponent(ButtonGroupHostComponent);
    hostFixture.detectChanges();
  });

  it('should apply group size to all child buttons', async () => {
    await hostFixture.whenStable();
    hostFixture.detectChanges();
    const buttons = hostFixture.nativeElement.querySelectorAll('.iris-button');
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach((btn: Element) => {
      expect(btn.classList.contains('iris-button--lg')).toBe(true);
    });
  });

  it('should propagate size change to child buttons', async () => {
    await hostFixture.whenStable();
    hostFixture.componentInstance.size = 'default';
    hostFixture.detectChanges();
    await hostFixture.whenStable();
    hostFixture.detectChanges();
    const buttons = hostFixture.nativeElement.querySelectorAll('.iris-button');
    buttons.forEach((btn: Element) => {
      expect(btn.classList.contains('iris-button--lg')).toBe(false);
    });
  });
});
