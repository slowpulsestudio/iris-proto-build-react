// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IrisAvatarComponent } from '@iris-ui/lib/avatar/avatar.component';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';
import type { UserRow } from './user-row';

@Component({
  selector: 'story-table-name-cell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IrisAvatarComponent],
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    `,
  ],
  template: `<iris-avatar size="md" [initials]="initials()" type="placeholder" /><span>{{ name() }}</span>`,
})
export class NameCellRenderer implements ICellRendererAngularComp {
  name = signal('');
  initials = signal('');

  agInit(params: ICellRendererParams<UserRow>): void {
    this.name.set(params.data?.name ?? '');
    this.initials.set(params.data?.initials ?? '');
  }

  refresh(params: ICellRendererParams<UserRow>): boolean {
    this.name.set(params.data?.name ?? '');
    this.initials.set(params.data?.initials ?? '');
    return true;
  }
}
