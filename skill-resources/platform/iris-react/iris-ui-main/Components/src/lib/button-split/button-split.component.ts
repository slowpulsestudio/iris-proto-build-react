// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IrisIconComponent } from '../icon/icon.component';
import { IrisMenuDirective } from '../menu/menu.directive';
import { MenuActionItem, MenuItem, MenuPosition } from '../menu/menu.model';
import { ButtonSplitVariant } from './button-split.model';

const NO_OPTIONS_ITEM: MenuItem = { id: 'no-options', type: 'item', label: 'No options available', disabled: true };

@Component({
  selector: 'iris-button-split',
  standalone: true,
  imports: [IrisIconComponent, IrisMenuDirective],
  templateUrl: './button-split.component.html',
  styleUrl: './button-split.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IrisButtonSplitComponent {
  variant = input<ButtonSplitVariant>('primary');
  label = input('Button');
  moreOptionsAriaLabel = input('More options');
  disabled = input(false);
  menu = input<MenuItem[]>([]);
  menuPosition = input<MenuPosition>('bottom-end');
  primaryClick = output<MouseEvent>();
  menuItemClick = output<MenuActionItem>();

  protected resolvedMenu = computed<MenuItem[]>(() => {
    const items = this.menu();
    return items.length > 0 ? items : [NO_OPTIONS_ITEM];
  });

  protected onPrimaryClick(event: MouseEvent): void {
    this.primaryClick.emit(event);
  }
}

export type { MenuActionItem, MenuSeparatorItem, MenuItem, MenuPosition } from '../menu/menu.model';
export type { ButtonSplitVariant } from './button-split.model';
