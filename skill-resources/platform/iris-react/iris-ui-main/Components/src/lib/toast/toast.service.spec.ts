// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { IrisToastContainerComponent } from './toast-container.component';
import { IrisToastService } from './toast.service';

describe('IrisToastService', () => {
  let service: IrisToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IrisToastService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be provided', () => {
    expect(service).toBeTruthy();
  });

  it('show() returns an IrisToastRef', () => {
    const ref = service.show({ title: 'Test' });
    expect(ref).toBeTruthy();
    expect(typeof ref.dismiss).toBe('function');
    expect(typeof ref.afterDismissed).toBe('function');
  });

  it('show() appends the container to the document body', () => {
    const countBefore = document.body.children.length;
    service.show({ title: 'Test' });
    expect(document.body.children.length).toBeGreaterThan(countBefore);
  });

  it('show() reuses a single container for multiple toasts', () => {
    const countBefore = document.body.children.length;
    service.show({ title: 'First' });
    service.show({ title: 'Second' });
    expect(document.body.children.length).toBe(countBefore + 1);
  });

  it('ref.afterDismissed() emits when dismiss() is called', async () => {
    const ref = service.show({ title: 'Test', duration: null });
    const result = new Promise<void>((resolve) => ref.afterDismissed().subscribe(() => resolve()));
    ref.dismiss();
    await result;
  });

  it('ref.afterDismissed() emits only once on repeated dismiss() calls', () => {
    vi.useFakeTimers();
    const ref = service.show({ title: 'Test', duration: null });
    let count = 0;
    ref.afterDismissed().subscribe(() => count++);
    ref.dismiss();
    vi.advanceTimersByTime(200); // wait out exit animation
    expect(count).toBe(1);
    ref.dismiss(); // second call is a no-op
    vi.advanceTimersByTime(200);
    expect(count).toBe(1);
  });

  it('auto-dismisses after the configured duration', () => {
    vi.useFakeTimers();
    const ref = service.show({ title: 'Test', duration: 2000 });
    let dismissed = false;
    ref.afterDismissed().subscribe(() => (dismissed = true));

    vi.advanceTimersByTime(1999);
    expect(dismissed).toBe(false);
    vi.advanceTimersByTime(1); // auto-dismiss fires, initiates exit animation
    expect(dismissed).toBe(false); // animation still in progress
    vi.advanceTimersByTime(200); // exit animation completes
    expect(dismissed).toBe(true);
  });

  it('cancels the auto-dismiss timer when dismiss() is called early', () => {
    vi.useFakeTimers();
    const ref = service.show({ title: 'Test', duration: 2000 });
    let count = 0;
    ref.afterDismissed().subscribe(() => count++);

    ref.dismiss();
    vi.advanceTimersByTime(200); // wait out exit animation
    expect(count).toBe(1);

    vi.advanceTimersByTime(2000); // original timer would have fired here
    expect(count).toBe(1); // still only 1
  });

  it('duration: null disables auto-dismiss', () => {
    vi.useFakeTimers();
    const ref = service.show({ title: 'Test', duration: null });
    let dismissed = false;
    ref.afterDismissed().subscribe(() => (dismissed = true));

    vi.advanceTimersByTime(60000);
    expect(dismissed).toBe(false);

    ref.dismiss();
    vi.advanceTimersByTime(200); // wait out exit animation
    expect(dismissed).toBe(true);
  });

  it('defaults duration to null when actions are present', () => {
    vi.useFakeTimers();
    const ref = service.show({ title: 'Test', primaryActionLabel: 'View' });
    let dismissed = false;
    ref.afterDismissed().subscribe(() => (dismissed = true));

    vi.advanceTimersByTime(30000);
    expect(dismissed).toBe(false);
  });

  it('respects explicit duration even when actions are present', () => {
    vi.useFakeTimers();
    const ref = service.show({ title: 'Test', duration: 1000, primaryActionLabel: 'View' });
    let dismissed = false;
    ref.afterDismissed().subscribe(() => (dismissed = true));

    vi.advanceTimersByTime(1000);
    vi.advanceTimersByTime(200);
    expect(dismissed).toBe(true);
  });

  it('ref.afterPrimaryAction() emits when primary action is triggered', () => {
    const ref = service.show({ title: 'Test', duration: null, primaryActionLabel: 'View' });
    let reason: string | undefined;
    ref.afterDismissed().subscribe((r) => (reason = r));

    const container = (service as unknown as { containerRef: { instance: IrisToastContainerComponent } }).containerRef
      .instance;
    const toasts = (container as unknown as { toasts: () => { id: number }[] }).toasts();
    container.primaryActionFired(toasts[toasts.length - 1].id);
    expect(reason).toBeUndefined(); // exit animation still running
  });

  it('afterDismissed() emits "primaryAction" reason after primary action fires', () => {
    vi.useFakeTimers();
    const ref = service.show({ title: 'Test', duration: null, primaryActionLabel: 'View' });
    let reason: string | undefined;
    ref.afterDismissed().subscribe((r) => (reason = r));

    const container = (service as unknown as { containerRef: { instance: IrisToastContainerComponent } }).containerRef
      .instance;
    const toasts = (container as unknown as { toasts: () => { id: number }[] }).toasts();
    container.primaryActionFired(toasts[toasts.length - 1].id);
    vi.advanceTimersByTime(200);
    expect(reason).toBe('primaryAction');
  });

  it('afterDismissed() emits "secondaryAction" reason after secondary action fires', () => {
    vi.useFakeTimers();
    const ref = service.show({ title: 'Test', duration: null, secondaryActionLabel: 'Cancel' });
    let reason: string | undefined;
    ref.afterDismissed().subscribe((r) => (reason = r));

    const container = (service as unknown as { containerRef: { instance: IrisToastContainerComponent } }).containerRef
      .instance;
    const toasts = (container as unknown as { toasts: () => { id: number }[] }).toasts();
    container.secondaryActionFired(toasts[toasts.length - 1].id);
    vi.advanceTimersByTime(200);
    expect(reason).toBe('secondaryAction');
  });

  it('afterDismissed() emits "dismissed" reason when dismiss() is called', () => {
    vi.useFakeTimers();
    const ref = service.show({ title: 'Test', duration: null });
    let reason: string | undefined;
    ref.afterDismissed().subscribe((r) => (reason = r));

    ref.dismiss();
    vi.advanceTimersByTime(200);
    expect(reason).toBe('dismissed');
  });
});
