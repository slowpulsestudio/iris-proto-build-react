// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  ViewContainerRef,
  afterNextRender,
  computed,
  forwardRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { IrisIconComponent } from '../icon/icon.component';
import { IRIS_SIDESHEET_CONTAINER, SidesheetFooterAlign } from './sidesheet.model';

@Component({
  selector: 'iris-sidesheet',
  standalone: true,
  imports: [IrisIconComponent],
  templateUrl: './sidesheet.component.html',
  styleUrl: './sidesheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: IRIS_SIDESHEET_CONTAINER, useExisting: forwardRef(() => IrisSidesheetComponent) }],
})
export class IrisSidesheetComponent {
  readonly title = input('');
  readonly subtitle = input('');
  readonly titleIcon = input('');
  readonly dismissable = input(true);
  readonly closeAriaLabel = input('Close');
  readonly closeOnEscape = input(true);
  readonly closeOnBackdropClick = input(true);
  readonly enableMaximizeToggle = input(false);
  readonly maximized = input(false);
  readonly maximizeAriaLabel = input('Maximize');
  readonly restoreAriaLabel = input('Restore');
  readonly footerAlign = input<SidesheetFooterAlign>('end');

  readonly closed = output<unknown>();
  readonly maximizedChange = output<boolean>();

  protected readonly footerClass = computed(
    () => `iris-sidesheet__footer iris-sidesheet__footer--${this.footerAlign()}`,
  );

  protected readonly isClosing = signal(false);
  /** Internal maximize state — writable so the toggle button mutates it without an external binding. */
  protected readonly maximizedState = linkedSignal(() => this.maximized());

  /** Outlet used by IrisSidesheetService to insert dynamically created content. */
  readonly bodyOutlet = viewChild('bodyOutlet', { read: ViewContainerRef });
  /** Outlet used by IrisSidesheetFooterDirective to render footer content from dynamic or template-based consumers. */
  readonly footerOutlet = viewChild('footerOutlet', { read: ViewContainerRef });

  private readonly panelElement = viewChild<ElementRef<HTMLElement>>('panelElement');
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly focusTrapFactory = inject(FocusTrapFactory);

  private focusTrap: FocusTrap | null = null;
  private closingData: unknown = undefined;

  constructor() {
    // The component is only in the DOM when CDK has attached it, so we trap focus on first render.
    afterNextRender(
      () => {
        const panelEl = this.panelElement()?.nativeElement;
        if (panelEl) {
          this.focusTrap = this.focusTrapFactory.create(panelEl);
          this.focusTrap.focusInitialElementWhenReady().then((focused) => {
            if (!focused) {
              panelEl.focus();
            }
          });
        }
      },
      { injector: this.injector },
    );

    this.destroyRef.onDestroy(() => {
      this.focusTrap?.destroy();
    });
  }

  close(data?: unknown): void {
    if (this.isClosing()) {
      return;
    }
    this.closingData = data;
    this.isClosing.set(true);

    const panel = this.panelElement()?.nativeElement;
    // Feature-detect animation support: jsdom does not implement getAnimations,
    // so we close synchronously in test environments.
    if (typeof panel?.getAnimations !== 'function') {
      this.finishClose();
    } else {
      panel.addEventListener('animationend', () => this.finishClose(), { once: true });
    }
  }

  private finishClose(): void {
    this.isClosing.set(false);
    this.closed.emit(this.closingData);
  }

  onBackdropClick(): void {
    if (this.dismissable() && this.closeOnBackdropClick()) {
      this.close();
    }
  }

  onDismiss(): void {
    this.close();
  }

  onToggleMaximize(): void {
    const next = !this.maximizedState();
    this.maximizedState.set(next);
    this.maximizedChange.emit(next);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.dismissable() && this.closeOnEscape()) {
      this.close();
    }
  }
}

export type { SidesheetFooterAlign, SidesheetSize } from './sidesheet.model';
