// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisSlidersComponent } from './sliders.component';

describe('IrisSlidersComponent', () => {
  let component: IrisSlidersComponent;
  let fixture: ComponentFixture<IrisSlidersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisSlidersComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(IrisSlidersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate progress percent', () => {
    fixture.componentRef.setInput('min', 0);
    fixture.componentRef.setInput('max', 100);
    fixture.componentRef.setInput('value', 50);
    fixture.detectChanges();
    expect(component.progressPercent()).toBe(50);
  });

  it('should apply disabled class', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const slidersElement = fixture.nativeElement.querySelector('.iris-sliders');
    expect(slidersElement.classList.contains('iris-sliders--disabled')).toBe(true);
  });

  it('should set input disabled attribute', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.disabled).toBe(true);
  });

  it('should update value on input', () => {
    const inputEl = fixture.nativeElement.querySelector('input');
    inputEl.value = '75';
    inputEl.dispatchEvent(new Event('input'));
    expect(component.valueState()).toBe(75);
  });

  it('should render custom thumb', () => {
    fixture.detectChanges();
    const thumb = fixture.nativeElement.querySelector('.iris-sliders__thumb');
    expect(thumb).toBeTruthy();
  });

  it('should show tooltip when label is tooltip and dragging', () => {
    fixture.componentRef.setInput('label', 'tooltip');
    fixture.detectChanges();
    component.dragging.set(true);
    fixture.detectChanges();
    const tooltip = fixture.nativeElement.querySelector('.iris-sliders__tooltip');
    expect(tooltip.classList.contains('iris-sliders__tooltip--visible')).toBe(true);
  });

  it('should show tooltip when label is tooltip and focused', () => {
    fixture.componentRef.setInput('label', 'tooltip');
    fixture.detectChanges();
    component.focused.set(true);
    fixture.detectChanges();
    const tooltip = fixture.nativeElement.querySelector('.iris-sliders__tooltip');
    expect(tooltip.classList.contains('iris-sliders__tooltip--visible')).toBe(true);
  });

  it('should not show tooltip when label is tooltip and neither focused nor dragging', () => {
    fixture.componentRef.setInput('label', 'tooltip');
    fixture.detectChanges();
    const tooltip = fixture.nativeElement.querySelector('.iris-sliders__tooltip');
    expect(tooltip.classList.contains('iris-sliders__tooltip--visible')).toBe(false);
  });

  it('should not show tooltip when label is none', () => {
    fixture.componentRef.setInput('label', 'none');
    fixture.detectChanges();
    component.dragging.set(true);
    fixture.detectChanges();
    const tooltip = fixture.nativeElement.querySelector('.iris-sliders__tooltip');
    expect(tooltip).toBeNull();
  });

  it('should show bottom label always when label is bottom', () => {
    fixture.componentRef.setInput('label', 'bottom');
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.iris-sliders__label');
    expect(label).toBeTruthy();
  });

  it('should clear keyboard focus when clicking outside', () => {
    const input = fixture.nativeElement.querySelector('input');
    input.dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    expect(component.focused()).toBe(true);

    component.onDocumentPointerDown({ target: document.body } as unknown as PointerEvent);
    fixture.detectChanges();
    expect(component.focused()).toBe(false);
  });

  it('should render two thumbs in dual-thumb mode', () => {
    fixture.componentRef.setInput('dualThumb', true);
    fixture.detectChanges();
    const thumbs = fixture.nativeElement.querySelectorAll('.iris-sliders__thumb');
    expect(thumbs.length).toBe(2);
  });

  it('should calculate progressLow and progressHigh for dual thumb', () => {
    fixture.componentRef.setInput('min', 0);
    fixture.componentRef.setInput('max', 100);
    fixture.componentRef.setInput('valueLow', 25);
    fixture.componentRef.setInput('valueHigh', 75);
    expect(component.progressLow()).toBe(25);
    expect(component.progressHigh()).toBe(75);
  });

  it('should update valueLow on dual-thumb low input', () => {
    fixture.componentRef.setInput('dualThumb', true);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = '30';
    inputs[0].dispatchEvent(new Event('input'));
    expect(component.valueLowState()).toBe(30);
  });

  it('should update valueHigh on dual-thumb high input', () => {
    fixture.componentRef.setInput('dualThumb', true);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[1].value = '80';
    inputs[1].dispatchEvent(new Event('input'));
    expect(component.valueHighState()).toBe(80);
  });

  it('should sanitize valueLow if it starts greater than or equal to valueHigh', () => {
    fixture.componentRef.setInput('dualThumb', true);
    fixture.componentRef.setInput('step', 1);
    fixture.componentRef.setInput('valueHigh', 20);
    fixture.componentRef.setInput('valueLow', 80);
    fixture.detectChanges();
    expect(component.valueLowState()).toBe(19);
  });

  it('should sanitize valueHigh if it is set below the existing valueLow', () => {
    fixture.componentRef.setInput('dualThumb', true);
    fixture.componentRef.setInput('step', 1);
    fixture.componentRef.setInput('valueLow', 50);
    fixture.detectChanges();
    fixture.componentRef.setInput('valueHigh', 20);
    fixture.detectChanges();
    expect(component.valueHighState()).toBe(51);
  });

  it('should clamp valueLow to not exceed valueHigh on keyboard input', () => {
    fixture.componentRef.setInput('dualThumb', true);
    fixture.componentRef.setInput('step', 1);
    fixture.componentRef.setInput('valueHigh', 50);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = '80';
    inputs[0].dispatchEvent(new Event('input'));
    expect(component.valueLowState()).toBe(49);
  });

  it('should clamp valueHigh to not go below valueLow on keyboard input', () => {
    fixture.componentRef.setInput('dualThumb', true);
    fixture.componentRef.setInput('step', 1);
    fixture.componentRef.setInput('valueLow', 50);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[1].value = '20';
    inputs[1].dispatchEvent(new Event('input'));
    expect(component.valueHighState()).toBe(51);
  });

  it('should clamp single-thumb value to min when set below min', () => {
    fixture.componentRef.setInput('min', 10);
    fixture.componentRef.setInput('value', 2);
    fixture.detectChanges();
    expect(component.valueState()).toBe(10);
  });

  it('should clamp single-thumb value to max when set above max', () => {
    fixture.componentRef.setInput('max', 80);
    fixture.componentRef.setInput('value', 120);
    fixture.detectChanges();
    expect(component.valueState()).toBe(80);
  });

  it('should clamp single-thumb value to min on keyboard input below min', () => {
    fixture.componentRef.setInput('min', 10);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    input.value = '2';
    input.dispatchEvent(new Event('input'));
    expect(component.valueState()).toBe(10);
  });

  it('should clamp single-thumb value to max on keyboard input above max', () => {
    fixture.componentRef.setInput('max', 80);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    input.value = '120';
    input.dispatchEvent(new Event('input'));
    expect(component.valueState()).toBe(80);
  });

  it('should clamp valueLow to min when set below min', () => {
    fixture.componentRef.setInput('dualThumb', true);
    fixture.componentRef.setInput('min', 10);
    fixture.componentRef.setInput('valueLow', 2);
    fixture.detectChanges();
    expect(component.valueLowState()).toBe(10);
  });

  it('should clamp valueHigh to max when set above max', () => {
    fixture.componentRef.setInput('dualThumb', true);
    fixture.componentRef.setInput('max', 80);
    fixture.componentRef.setInput('valueHigh', 120);
    fixture.detectChanges();
    expect(component.valueHighState()).toBe(80);
  });

  it('should preserve the low thumb when valueHigh is externally set below the minimum range', () => {
    fixture.componentRef.setInput('dualThumb', true);
    fixture.componentRef.setInput('min', 10);
    fixture.detectChanges();
    fixture.componentRef.setInput('valueHigh', 5);
    fixture.detectChanges();
    expect(component.valueLowState()).toBe(10);
    expect(component.valueHighState()).toBe(11);
  });

  it('should clamp valueLow to min on keyboard input below min', () => {
    fixture.componentRef.setInput('dualThumb', true);
    fixture.componentRef.setInput('min', 10);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = '2';
    inputs[0].dispatchEvent(new Event('input'));
    expect(component.valueLowState()).toBe(10);
  });

  it('should show dual-thumb tooltips for bottom labels when configured', () => {
    fixture.componentRef.setInput('dualThumb', true);
    fixture.componentRef.setInput('label', 'bottom');
    fixture.detectChanges();
    const labels = fixture.nativeElement.querySelectorAll('.iris-sliders__label');
    expect(labels.length).toBe(2);
  });

  it('should clamp valueHigh to max on keyboard input above max', () => {
    fixture.componentRef.setInput('dualThumb', true);
    fixture.componentRef.setInput('max', 80);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[1].value = '120';
    inputs[1].dispatchEvent(new Event('input'));
    expect(component.valueHighState()).toBe(80);
  });

  it('should not start drag when disabled on pointerdown', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    component.onPointerDown();
    component.onPointerMove();
    expect(component.dragging()).toBe(false);
  });

  it('should set dragging true on pointerdown then pointermove', () => {
    component.onPointerDown();
    component.onPointerMove();
    expect(component.dragging()).toBe(true);
  });

  it('should clear dragging on pointerup', () => {
    component.onPointerDown();
    component.onPointerMove();
    component.onPointerUp();
    expect(component.dragging()).toBe(false);
  });

  it('should not change state on pointermove without prior pointerdown', () => {
    component.onPointerMove();
    expect(component.dragging()).toBe(false);
  });

  it('should not start dual drag when disabled', () => {
    fixture.componentRef.setInput('dualThumb', true);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const mockEvent = {
      preventDefault: vi.fn(),
      clientX: 50,
      pointerId: 1,
      currentTarget: { setPointerCapture: vi.fn() },
    } as unknown as PointerEvent;
    component.onDualPointerDown(mockEvent);
    expect(component.draggingLow()).toBe(false);
  });

  it('should initiate dual drag toward the closer thumb on pointerdown', () => {
    fixture.componentRef.setInput('dualThumb', true);
    fixture.componentRef.setInput('min', 0);
    fixture.componentRef.setInput('max', 100);
    fixture.componentRef.setInput('valueLow', 20);
    fixture.componentRef.setInput('valueHigh', 80);
    fixture.detectChanges();
    vi.spyOn(component['_elementRef'].nativeElement, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      width: 100,
      right: 100,
      top: 0,
      bottom: 20,
      height: 20,
    } as DOMRect);
    const mockEvent = {
      preventDefault: vi.fn(),
      clientX: 15,
      pointerId: 1,
      currentTarget: { setPointerCapture: vi.fn() },
    } as unknown as PointerEvent;
    component.onDualPointerDown(mockEvent);
    expect(component.focusedLow()).toBe(true);
  });

  it('should update valueLow during dual pointermove toward low thumb', () => {
    fixture.componentRef.setInput('dualThumb', true);
    fixture.componentRef.setInput('min', 0);
    fixture.componentRef.setInput('max', 100);
    fixture.componentRef.setInput('valueLow', 20);
    fixture.componentRef.setInput('valueHigh', 80);
    fixture.detectChanges();
    vi.spyOn(component['_elementRef'].nativeElement, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      width: 100,
      right: 100,
      top: 0,
      bottom: 20,
      height: 20,
    } as DOMRect);
    const downEvent = {
      preventDefault: vi.fn(),
      clientX: 10,
      pointerId: 1,
      currentTarget: { setPointerCapture: vi.fn() },
    } as unknown as PointerEvent;
    component.onDualPointerDown(downEvent);
    const moveEvent = { clientX: 25 } as unknown as PointerEvent;
    component.onDualPointerMove(moveEvent);
    expect(component.draggingLow()).toBe(true);
  });

  it('should update valueHigh during dual pointermove toward high thumb', () => {
    fixture.componentRef.setInput('dualThumb', true);
    fixture.componentRef.setInput('min', 0);
    fixture.componentRef.setInput('max', 100);
    fixture.componentRef.setInput('valueLow', 20);
    fixture.componentRef.setInput('valueHigh', 80);
    fixture.detectChanges();
    vi.spyOn(component['_elementRef'].nativeElement, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      width: 100,
      right: 100,
      top: 0,
      bottom: 20,
      height: 20,
    } as DOMRect);
    const downEvent = {
      preventDefault: vi.fn(),
      clientX: 85,
      pointerId: 1,
      currentTarget: { setPointerCapture: vi.fn() },
    } as unknown as PointerEvent;
    component.onDualPointerDown(downEvent);
    const moveEvent = { clientX: 90 } as unknown as PointerEvent;
    component.onDualPointerMove(moveEvent);
    expect(component.draggingHigh()).toBe(true);
  });

  it('should clear dual drag state on pointerup', () => {
    fixture.componentRef.setInput('dualThumb', true);
    fixture.componentRef.setInput('min', 0);
    fixture.componentRef.setInput('max', 100);
    fixture.componentRef.setInput('valueLow', 20);
    fixture.componentRef.setInput('valueHigh', 80);
    fixture.detectChanges();
    vi.spyOn(component['_elementRef'].nativeElement, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      width: 100,
      right: 100,
      top: 0,
      bottom: 20,
      height: 20,
    } as DOMRect);
    const downEvent = {
      preventDefault: vi.fn(),
      clientX: 15,
      pointerId: 1,
      currentTarget: { setPointerCapture: vi.fn() },
    } as unknown as PointerEvent;
    component.onDualPointerDown(downEvent);
    component.onDualPointerUp();
    expect(component.draggingLow()).toBe(false);
    expect(component.draggingHigh()).toBe(false);
  });

  it('should not move on dual pointermove when no active thumb', () => {
    const moveEvent = { clientX: 50 } as unknown as PointerEvent;
    component.onDualPointerMove(moveEvent);
    expect(component.draggingLow()).toBe(false);
    expect(component.draggingHigh()).toBe(false);
  });

  it('should clamp low thumb when only valueLow is moved past valueHigh', () => {
    fixture.componentRef.setInput('dualThumb', true);
    fixture.componentRef.setInput('step', 1);
    fixture.detectChanges();
    // _previousLow=0, _previousHigh=100. Now change only valueLow to 100 (= valueHigh).
    fixture.componentRef.setInput('valueLow', 100);
    fixture.detectChanges();
    // lowChanged=true, highChanged=false, clampedLow(100) >= clampedHigh(100) → lines 117-119
    expect(component.valueLowState()).toBe(99);
  });

  it('should resolve tie-breaking by _dualActive when both thumbs cross simultaneously', () => {
    fixture.componentRef.setInput('dualThumb', true);
    fixture.componentRef.setInput('step', 1);
    fixture.detectChanges();
    // Establish _previousLow=0, _previousHigh=100, then set _dualActive='high'.
    component['_dualActive'] = 'high';
    fixture.componentRef.setInput('valueLow', 60);
    fixture.componentRef.setInput('valueHigh', 50);
    fixture.detectChanges();
    // Both changed, clampedLow(60) >= clampedHigh(50), _dualActive='high' → lines 127-129
    expect(component.valueHighState()).toBe(61);
  });

  it('should set aria-label on dual-thumb inputs', () => {
    fixture.componentRef.setInput('dualThumb', true);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input[type="range"]');
    expect(inputs[0].getAttribute('aria-label')).toBe('Minimum value');
    expect(inputs[1].getAttribute('aria-label')).toBe('Maximum value');
  });

  it('should use custom minimumValueAriaLabel and maximumValueAriaLabel', () => {
    fixture.componentRef.setInput('dualThumb', true);
    fixture.componentRef.setInput('minimumValueAriaLabel', 'Min');
    fixture.componentRef.setInput('maximumValueAriaLabel', 'Max');
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input[type="range"]');
    expect(inputs[0].getAttribute('aria-label')).toBe('Min');
    expect(inputs[1].getAttribute('aria-label')).toBe('Max');
  });
});
