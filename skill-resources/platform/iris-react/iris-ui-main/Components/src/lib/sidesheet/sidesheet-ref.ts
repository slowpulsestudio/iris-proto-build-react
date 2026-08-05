// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { Observable, Subject } from 'rxjs';

/**
 * A handle returned by IrisSidesheetService.open(). Use it to close the sidesheet
 * programmatically and to react to the result via afterClosed().
 *
 * @template R The type of the result value passed to close().
 */
export class IrisSidesheetRef<R = unknown> {
  private readonly closedSubject = new Subject<R>();
  private notified = false;

  private closeHandler?: (data?: R) => void;
  private cleanupHandler?: () => void;

  /**
   * Emits once with the value passed to close(), then completes.
   * Subscribers are automatically unsubscribed after the sidesheet closes.
   * Use firstValueFrom(ref.afterClosed()) if you need a Promise instead.
   */
  afterClosed(): Observable<R> {
    return this.closedSubject.asObservable();
  }

  /** Close the sidesheet, optionally passing result data to afterClosed(). */
  close(data?: R): void {
    this.closeHandler?.(data);
  }

  /** @internal — called by IrisSidesheetService to wire up close and cleanup. */
  _init(closeHandler: (data?: R) => void, cleanupHandler: () => void): void {
    this.closeHandler = closeHandler;
    this.cleanupHandler = cleanupHandler;
  }

  /** @internal — called by IrisSidesheetService when the sidesheet's closed event fires. */
  _notifyClosed(data: unknown): void {
    if (this.notified) {
      return;
    }
    this.notified = true;
    this.closedSubject.next(data as R);
    this.closedSubject.complete();
    this.cleanupHandler?.();
  }
}
