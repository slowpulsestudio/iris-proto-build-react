// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewContainerRef,
  computed,
  effect,
  forwardRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { IrisIconComponent } from '../icon/icon.component';
import { IRIS_MODAL_CONTAINER, ModalFooterAlign, ModalSize } from './modal.model';

@Component({
  selector: 'iris-modal',
  standalone: true,
  imports: [IrisIconComponent],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: IRIS_MODAL_CONTAINER, useExisting: forwardRef(() => IrisModalComponent) }],
})
export class IrisModalComponent {
  private static instanceCount = 0;
  private readonly instanceId = ++IrisModalComponent.instanceCount;

  readonly size = input<ModalSize>('md');
  readonly title = input('');
  readonly subtitle = input('');
  readonly titleIcon = input('');
  readonly dismissable = input(true);
  readonly closeAriaLabel = input('Close');
  readonly closeOnEscape = input(true);
  readonly closeOnBackdropClick = input(true);
  readonly hasBackdrop = input(true);
  readonly footerAlign = input<ModalFooterAlign>('end');

  readonly closed = output<unknown>();

  protected readonly isOpen = signal(false);
  protected readonly isClosing = signal(false);

  protected readonly titleId = `iris-modal-title-${this.instanceId}`;
  protected readonly subtitleId = `iris-modal-subtitle-${this.instanceId}`;

  protected readonly panelClassList = computed(() => {
    const classes = ['iris-modal', `iris-modal--${this.size()}`];
    if (this.isClosing()) {
      classes.push('iris-modal--closing');
    }
    return classes.join(' ');
  });

  protected readonly footerClass = computed(() => `iris-modal__footer iris-modal__footer--${this.footerAlign()}`);

  private readonly dialogElement = viewChild<ElementRef<HTMLDialogElement>>('dialogElement');
  private readonly panelElement = viewChild<ElementRef<HTMLElement>>('panelElement');

  /** Outlet used by IrisModalService to insert dynamically created content. */
  readonly bodyOutlet = viewChild('bodyOutlet', { read: ViewContainerRef });
  /** Outlet used by IrisModalFooterDirective to render footer content from dynamic or template-based consumers. */
  readonly footerOutlet = viewChild('footerOutlet', { read: ViewContainerRef });

  private closingData: unknown = undefined;

  constructor() {
    // Opens the native <dialog> in the browser top layer with focus trap and ::backdrop.
    effect(() => {
      const dialog = this.dialogElement()?.nativeElement;
      if (!dialog) {
        return;
      }
      if (this.isOpen() && !dialog.open) {
        dialog.showModal();
      }
    });
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(data?: unknown): void {
    if (!this.isOpen() || this.isClosing()) {
      return;
    }
    this.closingData = data;
    this.isClosing.set(true);

    const panel = this.panelElement()?.nativeElement;
    // Feature-detect animation support: jsdom does not implement getAnimations,
    // so we close synchronously in test environments. Real browsers wait for
    // the CSS exit animation (triggered by the --closing class) to complete.
    if (typeof panel?.getAnimations !== 'function') {
      this.finishClose();
    } else {
      panel.addEventListener('animationend', () => this.finishClose(), { once: true });
    }
  }

  private finishClose(): void {
    this.dialogElement()?.nativeElement.close();
    this.isOpen.set(false);
    this.isClosing.set(false);
    this.closed.emit(this.closingData);
  }

  onDialogClick(event: Event): void {
    if (event.target === event.currentTarget && this.dismissable() && this.closeOnBackdropClick()) {
      this.close();
    }
  }

  onNativeCancel(event: Event): void {
    event.preventDefault();
    if (this.dismissable() && this.closeOnEscape()) {
      this.close();
    }
  }

  onDismiss(): void {
    this.close();
  }
}

export type { ModalFooterAlign, ModalSize } from './modal.model';
