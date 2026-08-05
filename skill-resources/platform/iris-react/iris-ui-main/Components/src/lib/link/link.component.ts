// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LinkSize, LinkTarget } from './link.model';

@Component({
  selector: 'iris-link',
  standalone: true,
  imports: [],
  templateUrl: './link.component.html',
  styleUrl: './link.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IrisLinkComponent {
  href = input('');
  size = input<LinkSize>('default');
  disabled = input(false);
  text = input('');
  target = input<LinkTarget>('_self');

  displayText = computed(() => this.text() || this.href());
}

export type { LinkSize, LinkState, LinkTarget } from './link.model';
