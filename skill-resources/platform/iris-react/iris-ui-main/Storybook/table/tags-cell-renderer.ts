// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IrisTagComponent } from '@iris-ui/lib/tag/tag.component';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';
import type { UserRow } from './user-row';

@Component({
  selector: 'story-table-tags-cell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IrisTagComponent],
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    `,
  ],
  template: `@for (tag of tags(); track tag) {
    <iris-tag [text]="tag" [removable]="false" />
  }`,
})
export class TagsCellRenderer implements ICellRendererAngularComp {
  tags = signal<string[]>([]);

  agInit(params: ICellRendererParams<UserRow>): void {
    this.tags.set(params.value ?? []);
  }

  refresh(params: ICellRendererParams<UserRow>): boolean {
    this.tags.set(params.value ?? []);
    return true;
  }
}
