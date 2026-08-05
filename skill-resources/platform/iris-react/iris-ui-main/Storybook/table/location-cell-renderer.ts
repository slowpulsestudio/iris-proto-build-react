// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IrisIconComponent } from '@iris-ui/lib/icon/icon.component';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';
import type { UserRow } from './user-row';

@Component({
  selector: 'story-table-location-cell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IrisIconComponent],
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    `,
  ],
  template: `<iris-icon name="MapPin" [size]="16" label="" [decorative]="true" /><span>{{ location() }}</span>`,
})
export class LocationCellRenderer implements ICellRendererAngularComp {
  location = signal('');

  agInit(params: ICellRendererParams<UserRow>): void {
    this.location.set(params.value ?? '');
  }

  refresh(params: ICellRendererParams<UserRow>): boolean {
    this.location.set(params.value ?? '');
    return true;
  }
}
