// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { Observable, Subject } from 'rxjs';

/** Describes why a toast was dismissed. */
export type IrisToastDismissReason = 'dismissed' | 'primaryAction' | 'secondaryAction';

/** Reference to an active toast, returned by {@link IrisToastService.show}. */
export class IrisToastRef {
  private readonly dismissedSubject = new Subject<IrisToastDismissReason>();
  private pendingReason: IrisToastDismissReason = 'dismissed';
  private notified = false;
  private dismissHandler?: () => void;

  /**
   * Emits once when the toast is removed, carrying the reason for dismissal, then completes.
   * - `'dismissed'` — × button clicked, auto-dismiss fired, or `ref.dismiss()` called.
   * - `'primaryAction'` — primary action button was clicked (toast is also dismissed).
   * - `'secondaryAction'` — secondary action button was clicked (toast is also dismissed).
   */
  afterDismissed(): Observable<IrisToastDismissReason> {
    return this.dismissedSubject.asObservable();
  }

  /** Programmatically dismiss the toast. Safe to call multiple times. */
  dismiss(): void {
    this.dismissHandler?.();
  }

  /** @internal — called by IrisToastService to wire up the dismiss callback. */
  _init(dismissHandler: () => void): void {
    this.dismissHandler = dismissHandler;
  }

  /** @internal — called by IrisToastContainerComponent when the primary action button is clicked. */
  _notifyPrimaryAction(): void {
    this.pendingReason = 'primaryAction';
    this.dismissHandler?.();
  }

  /** @internal — called by IrisToastContainerComponent when the secondary action button is clicked. */
  _notifySecondaryAction(): void {
    this.pendingReason = 'secondaryAction';
    this.dismissHandler?.();
  }

  /** @internal — called by IrisToastContainerComponent when the toast is removed from the DOM. */
  _notifyDismissed(): void {
    if (this.notified) {
      return;
    }
    this.notified = true;
    this.dismissedSubject.next(this.pendingReason);
    this.dismissedSubject.complete();
  }
}
