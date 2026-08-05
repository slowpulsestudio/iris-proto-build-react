// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { IRIS_FORM_FIELD } from '../form-field/form-field.token';
import { IrisIconComponent } from '../icon/icon.component';
import { IrisTooltipDirective } from '../tooltip/tooltip.directive';
import { TooltipPosition } from '../tooltip/tooltip.model';
import { LabelType } from './label.model';

@Component({
  selector: 'iris-label',
  standalone: true,
  imports: [IrisIconComponent, IrisTooltipDirective],
  templateUrl: './label.component.html',
  styleUrl: './label.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IrisLabelComponent {
  type = input<LabelType>('default');
  requiredText = input('(Required)');
  infoText = input('');
  infoTooltipPosition = input<TooltipPosition>('top');
  countValue = input(0);
  countMax = input(0);

  private readonly formField = inject(IRIS_FORM_FIELD, { optional: true });

  protected readonly effectiveRequired = computed(() => this.formField?.isRequired() ?? false);
  protected readonly labelId = computed(() => this.formField?.labelId ?? null);
  protected readonly showInfoIcon = computed(() => this.infoText().length > 0);
  protected readonly effectiveCountValue = computed(() => this.formField?.countValue() ?? this.countValue());
  protected readonly effectiveCountMax = computed(() => this.formField?.countMax() ?? this.countMax());
  protected readonly showCount = computed(() => this.effectiveCountMax() > 0);
  protected readonly countLabel = computed(() => `${this.effectiveCountValue()}/${this.effectiveCountMax()}`);
}

export type { LabelType } from './label.model';
