// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IrisIconComponent } from '../icon/icon.component';

@Component({
  selector: 'iris-tag',
  standalone: true,
  imports: [IrisIconComponent],
  templateUrl: './tag.component.html',
  styleUrl: './tag.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IrisTagComponent {
  text = input('');
  removable = input(true);
  removeAriaLabel = input('Remove');
  removed = output<void>();

  onRemove(event: Event): void {
    event.stopPropagation();
    this.removed.emit();
  }

  onRemoveKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.removed.emit();
    }
  }
}

export type { TagConfig, TagState } from './tag.model';
