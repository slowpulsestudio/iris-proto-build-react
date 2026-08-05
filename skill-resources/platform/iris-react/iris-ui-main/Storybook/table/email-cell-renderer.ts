// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { IrisLinkComponent } from '@iris-ui/lib/link/link.component';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';
import type { UserRow } from './user-row';

@Component({
  selector: 'story-table-email-cell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IrisLinkComponent],
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        height: 100%;
      }
    `,
  ],
  template: `<iris-link [href]="mailtoHref()" [text]="email()" size="default" />`,
})
export class EmailCellRenderer implements ICellRendererAngularComp {
  email = signal('');
  mailtoHref = computed(() => `mailto:${this.email()}`);

  agInit(params: ICellRendererParams<UserRow>): void {
    this.email.set(params.value ?? '');
  }

  refresh(params: ICellRendererParams<UserRow>): boolean {
    this.email.set(params.value ?? '');
    return true;
  }
}
