// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IrisIconComponent } from '../icon/icon.component';
import { IrisMenuDirective } from '../menu/menu.directive';
import { MenuActionItem, MenuItem } from '../menu/menu.model';
import { BreadcrumbItem, BreadcrumbOverflowEvent } from './breadcrumb.model';

@Component({
  selector: 'iris-breadcrumb',
  standalone: true,
  imports: [IrisIconComponent, IrisMenuDirective],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IrisBreadcrumbComponent {
  items = input<BreadcrumbItem[]>([]);
  currentPageClickable = input(false);
  ariaLabel = input('Breadcrumb');
  maxVisibleItems = input(0);
  overflowItemSelected = output<BreadcrumbOverflowEvent>();

  protected readonly hasOverflow = computed(() => {
    const max = this.maxVisibleItems();
    return max > 0 && this.items().length > max;
  });

  protected readonly leadingItems = computed(() => {
    if (!this.hasOverflow()) {
      return this.items();
    }
    return this.items().slice(0, 1);
  });

  protected readonly trailingItems = computed(() => {
    if (!this.hasOverflow()) {
      return [];
    }
    const max = this.maxVisibleItems();
    return this.items().slice(-(max - 1));
  });

  protected readonly overflowMenuItems = computed<MenuItem[]>(() => {
    if (!this.hasOverflow()) {
      return [];
    }
    const max = this.maxVisibleItems();
    const hidden = this.items().slice(1, -(max - 1));
    return hidden.map((item, index) => ({
      id: `overflow-${index + 1}`,
      type: 'item' as const,
      label: item.label,
    }));
  });

  protected onOverflowItemSelected(menuItem: MenuActionItem): void {
    const max = this.maxVisibleItems();
    const hidden = this.items().slice(1, -(max - 1));
    const overflowIndex = this.overflowMenuItems().findIndex(
      (m) => m === menuItem || ('id' in m && m.id === menuItem.id),
    );
    if (overflowIndex >= 0) {
      const originalIndex = overflowIndex + 1;
      this.overflowItemSelected.emit({ item: hidden[overflowIndex], index: originalIndex });
    }
  }
}

export type { BreadcrumbItem, BreadcrumbOverflowEvent } from './breadcrumb.model';
