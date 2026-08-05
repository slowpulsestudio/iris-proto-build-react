// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { SubtextType } from './subtext.model';

@Component({
  selector: 'iris-subtext',
  standalone: true,
  templateUrl: './subtext.component.html',
  styleUrl: './subtext.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-visible]': 'visible()',
    '[attr.id]': 'subtextId()',
  },
})
export class IrisSubtextComponent {
  readonly type = input.required<SubtextType>();

  private readonly _visible = signal(true);
  protected readonly visible = this._visible.asReadonly();

  private readonly _subtextId = signal<string | null>(null);
  readonly subtextId = this._subtextId.asReadonly();

  /** Called by iris-form-field to manage which subtext is shown. */
  setVisible(visible: boolean): void {
    this._visible.set(visible);
  }

  /** Called by iris-form-field to assign a stable DOM id for aria-describedby. */
  setId(id: string): void {
    this._subtextId.set(id);
  }
}

export type { SubtextType } from './subtext.model';
