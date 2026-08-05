// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { IrisIconComponent } from '../icon/icon.component';
import { TabItem } from './tabs.model';

@Component({
  selector: 'iris-tabs',
  standalone: true,
  imports: [IrisIconComponent],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IrisTabsComponent {
  items = input<TabItem[]>([]);
  activeValue = input('');
  ariaLabel = input('');
  activeValueChange = output<string>();

  readonly activeValueState = linkedSignal(() => this.activeValue());

  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly tabStopValue = computed(() => this.activeValueState() || (this.items()[0]?.value ?? ''));

  select(value: string): void {
    this.activeValueState.set(value);
    this.activeValueChange.emit(value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      return;
    }
    event.preventDefault();

    const buttons = Array.from(
      this.elementRef.nativeElement.querySelectorAll('.iris-tabs__item'),
    ) as HTMLButtonElement[];
    if (!buttons.length) {
      return;
    }

    const currentIndex = buttons.findIndex((b) => b.getAttribute('data-value') === this.activeValueState());
    let nextIndex: number;
    if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = buttons.length - 1;
    } else {
      const forward = event.key === 'ArrowRight';
      nextIndex = forward ? (currentIndex + 1) % buttons.length : (currentIndex - 1 + buttons.length) % buttons.length;
    }

    const nextButton = buttons[nextIndex];
    nextButton.focus();
    const nextValue = nextButton.getAttribute('data-value') ?? '';
    if (nextValue) {
      this.select(nextValue);
    }
  }
}

export type { TabItem } from './tabs.model';
