// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SpinnerScenario, SpinnerSize } from './spinner.model';

const SPINNER_RADIUS = 9;
const SPINNER_CIRCUMFERENCE = 2 * Math.PI * SPINNER_RADIUS;
const SPINNER_ARC_LENGTH = SPINNER_CIRCUMFERENCE * 0.5;

@Component({
  selector: 'iris-spinner',
  standalone: true,
  imports: [],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'status', '[attr.aria-label]': 'ariaLabel()' },
})
export class IrisSpinnerComponent {
  size = input<SpinnerSize>('default');
  scenario = input<SpinnerScenario>('loop');
  progress = input(0);
  ariaLabel = input('Loading');

  protected isLoop = computed(() => this.scenario() === 'loop');
  protected isCompletion = computed(() => this.scenario() === 'completion');

  protected clampedProgress = computed(() => {
    const bounded = Math.min(100, Math.max(0, this.progress()));
    if (bounded === 100) {
      return 100;
    }
    if (bounded >= 91) {
      return 90;
    }
    return bounded;
  });

  protected progressDash = computed(() => {
    const filled = (this.clampedProgress() / 100) * SPINNER_CIRCUMFERENCE;
    return `${filled} ${SPINNER_CIRCUMFERENCE}`;
  });

  protected loopDash = `${SPINNER_ARC_LENGTH} ${SPINNER_CIRCUMFERENCE - SPINNER_ARC_LENGTH}`;
}

export type { SpinnerScenario, SpinnerSize } from './spinner.model';
