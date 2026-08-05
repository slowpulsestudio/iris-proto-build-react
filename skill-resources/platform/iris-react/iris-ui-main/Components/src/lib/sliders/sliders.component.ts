// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  untracked,
} from '@angular/core';
import type { SliderLabel } from './sliders.model';

@Component({
  selector: 'iris-sliders',
  standalone: true,
  imports: [],
  templateUrl: './sliders.component.html',
  styleUrl: './sliders.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IrisSlidersComponent {
  private readonly _elementRef = inject(ElementRef<HTMLElement>);
  private _pendingDrag = false;
  private _dualActive: 'low' | 'high' | null = null;
  private _dualPending = false;
  private _previousLow = 0;
  private _previousHigh = 100;

  min = input(0);
  max = input(100);
  step = input(1);
  value = input(0);
  disabled = input(false);
  dualThumb = input(false);
  label = input<SliderLabel>('tooltip');
  valueLow = input(0);
  valueHigh = input(100);
  minimumValueAriaLabel = input('Minimum value');
  maximumValueAriaLabel = input('Maximum value');
  valueChange = output<number>();
  valueLowChange = output<number>();
  valueHighChange = output<number>();

  readonly valueState = linkedSignal(() => this.value());
  readonly valueLowState = linkedSignal(() => this.valueLow());
  readonly valueHighState = linkedSignal(() => this.valueHigh());

  focused = signal(false);
  focusedLow = signal(false);
  focusedHigh = signal(false);
  dragging = signal(false);
  draggingLow = signal(false);
  draggingHigh = signal(false);

  progressPercent = computed(() => ((this.valueState() - this.min()) / (this.max() - this.min())) * 100);
  progressLow = computed(() => ((this.valueLowState() - this.min()) / (this.max() - this.min())) * 100);
  progressHigh = computed(() => ((this.valueHighState() - this.min()) / (this.max() - this.min())) * 100);

  constructor() {
    // Clamps single-thumb value to [min, max] on any external change.
    effect(() => {
      if (this.dualThumb()) {
        return;
      }
      const currentValue = this.valueState();
      const minValue = this.min();
      const maxValue = this.max();
      if (currentValue < minValue) {
        untracked(() => {
          this.valueState.set(minValue);
          this.valueChange.emit(minValue);
        });
      } else if (currentValue > maxValue) {
        untracked(() => {
          this.valueState.set(maxValue);
          this.valueChange.emit(maxValue);
        });
      }
    });

    // Enforces min <= valueLow < valueHigh <= max at all times, including externally set values.
    effect(() => {
      if (!this.dualThumb()) {
        return;
      }
      const low = this.valueLowState();
      const high = this.valueHighState();
      const step = this.step();
      const min = this.min();
      const max = this.max();
      const clampedLow = this._clampValue(low, min, max);
      const clampedHigh = this._clampValue(high, min, max);
      const lowChanged = clampedLow !== this._previousLow;
      const highChanged = clampedHigh !== this._previousHigh;
      untracked(() => {
        if (clampedLow !== low) {
          const maximumLow = Math.max(min, clampedHigh - step);
          const newLow = Math.min(clampedLow, maximumLow);
          this.valueLowState.set(newLow);
          this.valueLowChange.emit(newLow);
          return;
        }
        if (clampedHigh !== high) {
          const minimumHigh = Math.min(max, clampedLow + step);
          const newHigh = Math.max(clampedHigh, minimumHigh);
          this.valueHighState.set(newHigh);
          this.valueHighChange.emit(newHigh);
          return;
        }
        if (clampedLow >= clampedHigh) {
          const maximumLow = Math.max(min, clampedHigh - step);
          const minimumHigh = Math.min(max, clampedLow + step);
          if (lowChanged && !highChanged) {
            this.valueLowState.set(maximumLow);
            this.valueLowChange.emit(maximumLow);
            return;
          }
          if (highChanged && !lowChanged) {
            this.valueHighState.set(minimumHigh);
            this.valueHighChange.emit(minimumHigh);
            return;
          }
          if (this._dualActive === 'high') {
            this.valueHighState.set(minimumHigh);
            this.valueHighChange.emit(minimumHigh);
            return;
          }
          this.valueLowState.set(maximumLow);
          this.valueLowChange.emit(maximumLow);
        }
      });
      this._previousLow = this.valueLowState();
      this._previousHigh = this.valueHighState();
    });
  }

  onInput(event: Event): void {
    const newValue = Math.min(Math.max(Number((event.target as HTMLInputElement).value), this.min()), this.max());
    this.valueState.set(newValue);
    this.valueChange.emit(newValue);
  }

  onInputLow(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const newValue = Math.min(Math.max(Number(inputElement.value), this.min()), this.valueHighState() - this.step());
    this.valueLowState.set(newValue);
    this.valueLowChange.emit(newValue);
    inputElement.value = String(newValue);
  }

  onInputHigh(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const newValue = Math.max(Math.min(Number(inputElement.value), this.max()), this.valueLowState() + this.step());
    this.valueHighState.set(newValue);
    this.valueHighChange.emit(newValue);
    inputElement.value = String(newValue);
  }

  onPointerDown(): void {
    if (this.disabled()) {
      return;
    }
    this._pendingDrag = true;
  }

  onPointerMove(): void {
    if (this._pendingDrag) {
      this.dragging.set(true);
    }
  }

  onPointerUp(): void {
    this._pendingDrag = false;
    this.dragging.set(false);
  }

  @HostListener('document:pointerdown', ['$event'])
  onDocumentPointerDown(event: PointerEvent): void {
    if (!(this._elementRef.nativeElement as HTMLElement).contains(event.target as Node)) {
      this.focused.set(false);
      this.focusedLow.set(false);
      this.focusedHigh.set(false);
    }
  }

  onDualPointerDown(event: PointerEvent): void {
    if (this.disabled()) {
      return;
    }
    event.preventDefault();
    const value = this._valueFromPointerX(event.clientX);
    const distanceToLow = Math.abs(value - this.valueLowState());
    const distanceToHigh = Math.abs(value - this.valueHighState());
    this._dualActive = distanceToLow <= distanceToHigh ? 'low' : 'high';
    this._dualPending = true;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.focusedLow.set(this._dualActive === 'low');
    this.focusedHigh.set(this._dualActive === 'high');
    if (this._dualActive === 'low') {
      const newValue = Math.min(value, this.valueHighState() - this.step());
      this.valueLowState.set(newValue);
      this.valueLowChange.emit(newValue);
    } else {
      const newValue = Math.max(value, this.valueLowState() + this.step());
      this.valueHighState.set(newValue);
      this.valueHighChange.emit(newValue);
    }
  }

  onDualPointerMove(event: PointerEvent): void {
    if (!this._dualActive) {
      return;
    }
    if (this._dualPending) {
      this._dualPending = false;
      if (this._dualActive === 'low') {
        this.draggingLow.set(true);
      } else {
        this.draggingHigh.set(true);
      }
    }
    const value = this._valueFromPointerX(event.clientX);
    if (this._dualActive === 'low') {
      const newValue = Math.min(Math.max(value, this.min()), this.valueHighState() - this.step());
      this.valueLowState.set(newValue);
      this.valueLowChange.emit(newValue);
    } else {
      const newValue = Math.max(Math.min(value, this.max()), this.valueLowState() + this.step());
      this.valueHighState.set(newValue);
      this.valueHighChange.emit(newValue);
    }
  }

  onDualPointerUp(): void {
    this._dualActive = null;
    this._dualPending = false;
    this.draggingLow.set(false);
    this.draggingHigh.set(false);
  }

  private _valueFromPointerX(clientX: number): number {
    const boundingRect = (this._elementRef.nativeElement as HTMLElement).getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - boundingRect.left) / boundingRect.width));
    const rawValue = this.min() + ratio * (this.max() - this.min());
    return Math.round((rawValue - this.min()) / this.step()) * this.step() + this.min();
  }

  private _clampValue(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}

export type { SliderConfig, SliderLabel, SliderState } from './sliders.model';
