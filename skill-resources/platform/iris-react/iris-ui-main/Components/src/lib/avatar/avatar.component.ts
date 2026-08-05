// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IrisIconComponent } from '../icon/icon.component';
import { AvatarCategory, AvatarSize, AvatarType } from './avatar.model';

const NHI_ICON_MAP: Record<string, string> = {
  machine: 'Desktop',
  'service-account': 'Bulldozer',
  workload: 'CraneTower',
  bot: 'Robot',
  'ai-agent': 'Sparkle',
};

@Component({
  selector: 'iris-avatar',
  standalone: true,
  imports: [IrisIconComponent],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IrisAvatarComponent {
  size = input<AvatarSize>('default');
  type = input<AvatarType>('placeholder');
  category = input<AvatarCategory>('human');
  initials = input('');
  src = input('');
  alt = input('');

  protected readonly isNhiType = computed(() => this.category() === 'nhi');
  protected readonly nhiIconName = computed(() => NHI_ICON_MAP[this.type()] ?? '');
  protected readonly iconDisplaySize = computed(() => (this.size() === 'sm' ? 16 : 20));
}

export type { AvatarCategory, AvatarSize, AvatarType } from './avatar.model';
