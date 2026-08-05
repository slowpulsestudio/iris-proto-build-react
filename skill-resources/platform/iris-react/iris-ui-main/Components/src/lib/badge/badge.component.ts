// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IrisIconComponent } from '../icon/icon.component';
import { BadgeType } from './badge.model';

@Component({
  selector: 'iris-badge',
  standalone: true,
  imports: [IrisIconComponent],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IrisBadgeComponent {
  type = input<BadgeType>('default');
  strong = input(false);
  text = input('');
  iconName = input('');
}

export type { BadgeType, BadgeConfig } from './badge.model';
