// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IrisIconComponent } from '@iris-ui/lib/icon/icon.component';
import { IHeaderAngularComp } from 'ag-grid-angular';
import type { IHeaderParams } from 'ag-grid-community';

interface IconHeaderParams extends IHeaderParams {
  iconName: string;
}

@Component({
  selector: 'story-table-icon-header',
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
  template: `<iris-icon [name]="iconName()" [size]="20" label="" [decorative]="true" /><span>{{ label() }}</span>`,
})
export class IconHeaderRenderer implements IHeaderAngularComp {
  iconName = signal('');
  label = signal('');

  agInit(params: IconHeaderParams): void {
    this.iconName.set(params.iconName ?? '');
    this.label.set(params.displayName ?? '');
  }

  refresh(params: IconHeaderParams): boolean {
    this.iconName.set(params.iconName ?? '');
    this.label.set(params.displayName ?? '');
    return true;
  }
}
