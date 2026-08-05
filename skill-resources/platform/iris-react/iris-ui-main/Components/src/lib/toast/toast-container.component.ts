// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IrisToastConfig } from './toast-config';
import { IrisToastRef } from './toast-ref';
import { IrisToastComponent } from './toast.component';

const EXIT_ANIMATION_MS = 180;

interface ToastEntry {
  id: number;
  config: IrisToastConfig;
  ref: IrisToastRef;
  leaving: boolean;
}

@Component({
  selector: 'iris-toast-container',
  standalone: true,
  imports: [IrisToastComponent],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IrisToastContainerComponent {
  protected readonly toasts = signal<ToastEntry[]>([]);
  private idCounter = 0;

  add(config: IrisToastConfig, ref: IrisToastRef): number {
    const id = ++this.idCounter;
    this.toasts.update((list) => [...list, { id, config, ref, leaving: false }]);
    return id;
  }

  primaryActionFired(id: number): void {
    const entry = this.toasts().find((e) => e.id === id);
    entry?.ref._notifyPrimaryAction();
  }

  secondaryActionFired(id: number): void {
    const entry = this.toasts().find((e) => e.id === id);
    entry?.ref._notifySecondaryAction();
  }

  initiateRemoval(id: number): void {
    const entry = this.toasts().find((e) => e.id === id);
    if (!entry || entry.leaving) {
      return;
    }
    this.toasts.update((list) => list.map((e) => (e.id === id ? { ...e, leaving: true } : e)));
    setTimeout(() => this.remove(id), EXIT_ANIMATION_MS);
  }

  remove(id: number): void {
    const entry = this.toasts().find((e) => e.id === id);
    this.toasts.update((list) => list.filter((e) => e.id !== id));
    entry?.ref._notifyDismissed();
  }
}
