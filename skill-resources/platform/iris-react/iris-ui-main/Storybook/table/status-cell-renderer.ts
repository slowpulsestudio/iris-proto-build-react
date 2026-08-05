// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IrisBadgeComponent } from '@iris-ui/lib/badge/badge.component';
import type { BadgeType } from '@iris-ui/lib/badge/badge.model';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';
import type { UserRow } from './user-row';

@Component({
  selector: 'story-table-status-cell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IrisBadgeComponent],
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
      }
    `,
  ],
  template: `<iris-badge [type]="statusType()" [text]="status()" />`,
})
export class StatusCellRenderer implements ICellRendererAngularComp {
  status = signal('');
  statusType = signal<BadgeType>('default');

  agInit(params: ICellRendererParams<UserRow>): void {
    this.status.set(params.data?.status ?? '');
    this.statusType.set(params.data?.statusType ?? 'default');
  }

  refresh(params: ICellRendererParams<UserRow>): boolean {
    this.status.set(params.data?.status ?? '');
    this.statusType.set(params.data?.statusType ?? 'default');
    return true;
  }
}
