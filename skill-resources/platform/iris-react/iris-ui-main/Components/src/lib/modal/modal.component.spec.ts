// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisModalComponent } from './modal.component';

describe('IrisModalComponent', () => {
  let component: IrisModalComponent;
  let fixture: ComponentFixture<IrisModalComponent>;

  beforeEach(async () => {
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      value: vi.fn().mockImplementation(function (this: HTMLDialogElement) {
        this.setAttribute('open', '');
      }),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', {
      value: vi.fn().mockImplementation(function (this: HTMLDialogElement) {
        this.removeAttribute('open');
      }),
      writable: true,
      configurable: true,
    });

    await TestBed.configureTestingModule({
      imports: [IrisModalComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(IrisModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    delete (HTMLDialogElement.prototype as unknown as Record<string, unknown>)['showModal'];
    delete (HTMLDialogElement.prototype as unknown as Record<string, unknown>)['close'];
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not be open by default', () => {
    const dialog = fixture.nativeElement.querySelector('dialog');
    expect(dialog.hasAttribute('open')).toBe(false);
  });

  it('should be open after open() is called', () => {
    component.open();
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('dialog');
    expect(dialog.hasAttribute('open')).toBe(true);
  });

  it('should call showModal when open() is called', () => {
    component.open();
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('dialog');
    expect(dialog.showModal).toHaveBeenCalled();
  });

  it('should not be open after close() is called', () => {
    component.open();
    fixture.detectChanges();
    component.close();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('dialog').hasAttribute('open')).toBe(false);
  });

  it('should emit closed when close() is called', () => {
    component.open();
    fixture.detectChanges();
    const closedSpy = vi.spyOn(component.closed, 'emit');
    component.close();
    expect(closedSpy).toHaveBeenCalledWith(undefined);
  });

  it('should emit closed with data when close(data) is called', () => {
    component.open();
    fixture.detectChanges();
    const closedSpy = vi.spyOn(component.closed, 'emit');
    component.close({ confirmed: true });
    expect(closedSpy).toHaveBeenCalledWith({ confirmed: true });
  });

  it('should not emit closed when close() is called while already closed', () => {
    const closedSpy = vi.spyOn(component.closed, 'emit');
    component.close();
    expect(closedSpy).not.toHaveBeenCalled();
  });

  it('should apply size class', () => {
    component.open();
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-modal--lg')).toBeTruthy();
  });

  it('should display the title', () => {
    fixture.componentRef.setInput('title', 'Confirm Action');
    fixture.detectChanges();
    const titleElement = fixture.nativeElement.querySelector('.iris-modal__title');
    expect(titleElement.textContent).toContain('Confirm Action');
  });

  it('should display the subtitle when provided', () => {
    fixture.componentRef.setInput('subtitle', 'Please review your changes');
    fixture.detectChanges();
    const subtitleElement = fixture.nativeElement.querySelector('.iris-modal__subtitle');
    expect(subtitleElement.textContent).toContain('Please review your changes');
  });

  it('should not show subtitle when empty', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-modal__subtitle')).toBeNull();
  });

  it('should show dismiss button when dismissable', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-modal__dismiss')).toBeTruthy();
  });

  it('should hide dismiss button when not dismissable', () => {
    fixture.componentRef.setInput('dismissable', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-modal__dismiss')).toBeNull();
  });

  it('should emit closed when dismiss button is clicked', () => {
    component.open();
    fixture.detectChanges();
    const closedSpy = vi.spyOn(component.closed, 'emit');
    fixture.nativeElement.querySelector('.iris-modal__dismiss').click();
    expect(closedSpy).toHaveBeenCalled();
  });

  it('should emit closed when backdrop is clicked by default', () => {
    component.open();
    fixture.detectChanges();
    const closedSpy = vi.spyOn(component.closed, 'emit');
    fixture.nativeElement.querySelector('dialog').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(closedSpy).toHaveBeenCalled();
  });

  it('should emit closed on Escape by default', () => {
    component.open();
    fixture.detectChanges();
    const closedSpy = vi.spyOn(component.closed, 'emit');
    fixture.nativeElement.querySelector('dialog').dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(closedSpy).toHaveBeenCalled();
  });

  it('should not close on backdrop or Escape when dismissable is false', () => {
    component.open();
    fixture.componentRef.setInput('dismissable', false);
    fixture.detectChanges();
    const closedSpy = vi.spyOn(component.closed, 'emit');
    fixture.nativeElement.querySelector('dialog').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.nativeElement.querySelector('dialog').dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(closedSpy).not.toHaveBeenCalled();
  });

  it('should have aria-labelledby pointing to the title element id', () => {
    const dialog = fixture.nativeElement.querySelector('dialog');
    const title = fixture.nativeElement.querySelector('.iris-modal__title');
    expect(dialog.getAttribute('aria-labelledby')).toBe(title.getAttribute('id'));
  });

  it('should set aria-describedby when subtitle is provided', () => {
    fixture.componentRef.setInput('subtitle', 'Subtitle text');
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('dialog');
    const subtitle = fixture.nativeElement.querySelector('.iris-modal__subtitle');
    expect(dialog.getAttribute('aria-describedby')).toBe(subtitle.getAttribute('id'));
  });

  it('should not set aria-describedby when subtitle is empty', () => {
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('dialog');
    expect(dialog.hasAttribute('aria-describedby')).toBe(false);
  });

  it('should show title icon when titleIcon is set', () => {
    fixture.componentRef.setInput('titleIcon', 'Info');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-modal__title-icon')).toBeTruthy();
  });

  it('should not show title icon when titleIcon is empty', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-modal__title-icon')).toBeNull();
  });

  it('should apply hasBackdrop class to dialog', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-modal-dialog--backdrop')).toBeTruthy();
  });

  it('should not apply hasBackdrop class when hasBackdrop is false', () => {
    fixture.componentRef.setInput('hasBackdrop', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-modal-dialog--backdrop')).toBeNull();
  });

  it('should close on Escape when closeOnEscape is true', () => {
    component.open();
    fixture.detectChanges();
    const closedSpy = vi.spyOn(component.closed, 'emit');
    fixture.nativeElement.querySelector('dialog').dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(closedSpy).toHaveBeenCalled();
  });

  it('should not close on Escape when closeOnEscape is false', () => {
    component.open();
    fixture.componentRef.setInput('closeOnEscape', false);
    fixture.detectChanges();
    const closedSpy = vi.spyOn(component.closed, 'emit');
    fixture.nativeElement.querySelector('dialog').dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(closedSpy).not.toHaveBeenCalled();
  });

  it('should close on backdrop click when closeOnBackdropClick is true', () => {
    component.open();
    fixture.detectChanges();
    const closedSpy = vi.spyOn(component.closed, 'emit');
    fixture.nativeElement.querySelector('dialog').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(closedSpy).toHaveBeenCalled();
  });

  it('should not close on backdrop click when closeOnBackdropClick is false', () => {
    component.open();
    fixture.componentRef.setInput('closeOnBackdropClick', false);
    fixture.detectChanges();
    const closedSpy = vi.spyOn(component.closed, 'emit');
    fixture.nativeElement.querySelector('dialog').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(closedSpy).not.toHaveBeenCalled();
  });

  it('should apply footer alignment class', () => {
    fixture.componentRef.setInput('footerAlign', 'center');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-modal__footer--center')).toBeTruthy();
  });

  it('should apply iris-modal--closing class and wait for animationend before closing', () => {
    component.open();
    fixture.detectChanges();
    const panel = fixture.nativeElement.querySelector('.iris-modal');
    Object.defineProperty(panel, 'getAnimations', {
      value: () => [{}],
      configurable: true,
      writable: true,
    });
    component.close();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-modal--closing')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('dialog').hasAttribute('open')).toBe(true);
    panel.dispatchEvent(new Event('animationend'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('dialog').hasAttribute('open')).toBe(false);
  });

  it('should use default aria-label "Close" on dismiss button', () => {
    const btn = fixture.nativeElement.querySelector('.iris-modal__dismiss');
    expect(btn.getAttribute('aria-label')).toBe('Close');
  });

  it('should use custom closeAriaLabel on dismiss button', () => {
    fixture.componentRef.setInput('closeAriaLabel', 'Fermer');
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.iris-modal__dismiss');
    expect(btn.getAttribute('aria-label')).toBe('Fermer');
  });
});
