// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { IrisRadioButtonComponent } from './radio-button.component';
import { IrisRadioGroupComponent } from './radio-group.component';
import { RadioButtonSize } from './radio-group.model';

@Component({
  standalone: true,
  imports: [IrisRadioGroupComponent, IrisRadioButtonComponent],
  template: `
    <iris-radio-group [size]="size" [disabled]="groupDisabled" [(value)]="selectedValue">
      <iris-radio-button value="a">Option A</iris-radio-button>
      <iris-radio-button value="b">Option B</iris-radio-button>
      <iris-radio-button value="c" [disabled]="optionCDisabled" supportingText="Extra info">Option C</iris-radio-button>
    </iris-radio-group>
  `,
})
class TestHostComponent {
  size: RadioButtonSize = 'sm';
  groupDisabled = false;
  selectedValue = 'a';
  optionCDisabled = false;
}

describe('IrisRadioGroupComponent + IrisRadioButtonComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  function buttons(): NodeListOf<HTMLElement> {
    return fixture.nativeElement.querySelectorAll('iris-radio-button');
  }

  function groupInstance(): IrisRadioGroupComponent {
    return fixture.debugElement.query(By.css('iris-radio-group')).componentInstance as IrisRadioGroupComponent;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render three radio buttons', () => {
    expect(buttons().length).toBe(3);
  });

  it('should mark the selected option with aria-checked', () => {
    expect(buttons()[0].getAttribute('aria-checked')).toBe('true');
    expect(buttons()[1].getAttribute('aria-checked')).toBe('false');
    expect(buttons()[2].getAttribute('aria-checked')).toBe('false');
  });

  it('should select an option on click', () => {
    buttons()[1].click();
    fixture.detectChanges();
    expect(host.selectedValue).toBe('b');
    expect(buttons()[1].getAttribute('aria-checked')).toBe('true');
  });

  it('should select an option on space key', () => {
    buttons()[1].dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    fixture.detectChanges();
    expect(host.selectedValue).toBe('b');
  });

  it('should not change value when group is disabled', () => {
    host.groupDisabled = true;
    fixture.detectChanges();
    buttons()[1].click();
    fixture.detectChanges();
    expect(host.selectedValue).toBe('a');
  });

  it('should not change value when individual option is disabled', () => {
    host.optionCDisabled = true;
    fixture.detectChanges();
    buttons()[2].click();
    fixture.detectChanges();
    expect(host.selectedValue).toBe('a');
  });

  it('should apply disabled class and aria-disabled to individual disabled option', () => {
    host.optionCDisabled = true;
    fixture.detectChanges();
    expect(buttons()[2].getAttribute('aria-disabled')).toBe('true');
    expect(buttons()[2].classList).toContain('iris-radio-button--disabled');
  });

  it('should apply md size class to all buttons', () => {
    host.size = 'md';
    fixture.detectChanges();
    expect(buttons()[0].classList).toContain('iris-radio-button--md');
    expect(buttons()[1].classList).toContain('iris-radio-button--md');
  });

  it('should render supporting text', () => {
    const supportingText = fixture.nativeElement.querySelector('.iris-radio-button__supporting-text');
    expect(supportingText.textContent.trim()).toBe('Extra info');
  });

  describe('ControlValueAccessor', () => {
    it('should update selected value via writeValue', () => {
      groupInstance().writeValue('b');
      fixture.detectChanges();
      expect(groupInstance().value()).toBe('b');
      expect(buttons()[1].getAttribute('aria-checked')).toBe('true');
    });

    it('should call notifyChange when an option is selected', () => {
      const spy = vi.fn();
      groupInstance().registerOnChange(spy);
      buttons()[2].click();
      expect(spy).toHaveBeenCalledWith('c');
    });

    it('should call notifyTouched when an option is selected', () => {
      const spy = vi.fn();
      groupInstance().registerOnTouched(spy);
      buttons()[0].click();
      expect(spy).toHaveBeenCalled();
    });

    it('should disable interaction via setDisabledState', () => {
      groupInstance().setDisabledState(true);
      fixture.detectChanges();
      buttons()[1].click();
      fixture.detectChanges();
      expect(host.selectedValue).toBe('a');
    });

    it('should not select when disabled radio button receives Space key', () => {
      host.optionCDisabled = true;
      fixture.detectChanges();
      buttons()[2].dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      fixture.detectChanges();
      expect(host.selectedValue).toBe('a');
    });

    it('should move focus and select next option on ArrowDown', () => {
      const groupEl: HTMLElement = fixture.nativeElement.querySelector('iris-radio-group');
      groupEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      fixture.detectChanges();
      expect(host.selectedValue).toBe('b');
    });

    it('should move focus and select previous option on ArrowUp', () => {
      const groupEl: HTMLElement = fixture.nativeElement.querySelector('iris-radio-group');
      groupEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
      fixture.detectChanges();
      expect(host.selectedValue).toBe('c');
    });

    it('should not navigate on arrow keys when group is disabled', () => {
      host.groupDisabled = true;
      fixture.detectChanges();
      const groupEl: HTMLElement = fixture.nativeElement.querySelector('iris-radio-group');
      groupEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      fixture.detectChanges();
      expect(host.selectedValue).toBe('a');
    });

    it('should give only selected radio tabindex 0', () => {
      fixture.detectChanges();
      const btns = buttons();
      expect(btns[0].getAttribute('tabindex')).toBe('0');
      expect(btns[1].getAttribute('tabindex')).toBe('-1');
      expect(btns[2].getAttribute('tabindex')).toBe('-1');
    });

    it('should not allow selection when group is disabled', () => {
      host.groupDisabled = true;
      fixture.detectChanges();
      groupInstance().select('b');
      fixture.detectChanges();
      expect(host.selectedValue).toBe('a');
    });

    it('should work with ReactiveFormsModule formControlName', () => {
      @Component({
        standalone: true,
        imports: [IrisRadioGroupComponent, IrisRadioButtonComponent, ReactiveFormsModule],
        template: `
          <form [formGroup]="form">
            <iris-radio-group formControlName="choice">
              <iris-radio-button value="x">X</iris-radio-button>
              <iris-radio-button value="y">Y</iris-radio-button>
            </iris-radio-group>
          </form>
        `,
      })
      class FormTestComponent {
        form = new FormGroup({ choice: new FormControl('x') });
      }

      const formFixture = TestBed.createComponent(FormTestComponent);
      formFixture.detectChanges();
      const formHost = formFixture.componentInstance;

      formFixture.nativeElement.querySelectorAll('iris-radio-button')[1].click();
      expect(formHost.form.value).toEqual({ choice: 'y' });

      formHost.form.controls.choice.setValue('x');
      formFixture.detectChanges();
      const group = formFixture.debugElement.query(By.css('iris-radio-group'))
        .componentInstance as IrisRadioGroupComponent;
      expect(group.value()).toBe('x');
    });
  });

  describe('aria-label', () => {
    it('should not set aria-label by default', () => {
      fixture.detectChanges();
      const groupEl: HTMLElement = fixture.nativeElement.querySelector('iris-radio-group');
      expect(groupEl.getAttribute('aria-label')).toBeNull();
    });

    it('should set aria-label when ariaLabel input is provided', () => {
      @Component({
        standalone: true,
        imports: [IrisRadioGroupComponent, IrisRadioButtonComponent],
        template: `
          <iris-radio-group [ariaLabel]="label">
            <iris-radio-button value="a">A</iris-radio-button>
          </iris-radio-group>
        `,
      })
      class AriaHostComponent {
        label = 'Colour';
      }
      const ariaFixture = TestBed.createComponent(AriaHostComponent);
      ariaFixture.detectChanges();
      const groupEl: HTMLElement = ariaFixture.nativeElement.querySelector('iris-radio-group');
      expect(groupEl.getAttribute('aria-label')).toBe('Colour');
    });
  });
});
