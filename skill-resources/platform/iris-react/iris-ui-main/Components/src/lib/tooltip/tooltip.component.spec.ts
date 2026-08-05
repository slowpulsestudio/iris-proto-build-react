// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisTooltipComponent } from './tooltip.component';

describe('IrisTooltipComponent', () => {
  let component: IrisTooltipComponent;
  let fixture: ComponentFixture<IrisTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisTooltipComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(IrisTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render text', () => {
    fixture.componentRef.setInput('text', 'Save changes');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-tooltip__text').textContent).toBe('Save changes');
  });

  it('should not render shortcut section when shortcut is empty', () => {
    fixture.componentRef.setInput('shortcut', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-tooltip__shortcut')).toBeNull();
  });

  it('should render a single keyboard key component for the shortcut', () => {
    fixture.componentRef.setInput('shortcut', ['⌘', 'S']);
    fixture.detectChanges();
    const keys = fixture.nativeElement.querySelectorAll('iris-keyboard-key');
    expect(keys.length).toBe(1);
  });
});
