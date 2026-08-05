// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  Signal,
  TemplateRef,
  ViewContainerRef,
  computed,
  forwardRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NgControl, Validators } from '@angular/forms';
import { Subscription, merge } from 'rxjs';
import { IrisFormControl, IRIS_FORM_FIELD, IrisFormFieldState } from '../form-field/form-field.token';
import { IrisIconComponent } from '../icon/icon.component';
import { DropdownOption, DropdownOptionItem, DropdownSize } from './dropdown.model';

@Component({
  selector: 'iris-dropdown',
  standalone: true,
  imports: [IrisIconComponent],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: IrisFormControl, useExisting: forwardRef(() => IrisDropdownComponent) }],
})
export class IrisDropdownComponent implements ControlValueAccessor, OnInit, OnDestroy, IrisFormControl {
  readonly placeholder = input('Choose an option...');
  readonly options = input<DropdownOption[]>([]);
  readonly value = input('');
  readonly size = input<DropdownSize>('default');
  readonly disabled = input(false);
  readonly leadingIcon = input('');

  readonly valueChange = output<string>();

  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  protected readonly formField = inject<IrisFormFieldState>(IRIS_FORM_FIELD, { optional: true });

  private readonly controlInvalid = signal(false);
  private readonly controlTouched = signal(false);
  private readonly controlDisabled = signal(false);

  protected readonly valueState = linkedSignal(() => this.value());
  protected readonly isOpen = signal(false);

  readonly isInvalid: Signal<boolean> = computed(() => this.controlInvalid());
  readonly isTouched: Signal<boolean> = computed(() => this.controlTouched());
  readonly isRequired: Signal<boolean> = computed(
    () => this.ngControl?.control?.hasValidator(Validators.required) ?? false,
  );
  readonly countValue: Signal<number> = signal(0);
  readonly countMax: Signal<number> = signal(0);

  protected readonly effectiveDisabled = computed(() => this.disabled() || this.controlDisabled());
  protected readonly effectiveHasError = computed(
    () => this.ngControl !== null && this.controlInvalid() && this.controlTouched(),
  );
  protected readonly ariaIsRequired = computed(
    () => this.ngControl?.control?.hasValidator(Validators.required) ?? false,
  );

  protected readonly listboxId = `iris-dropdown-listbox-${Math.random().toString(36).slice(2, 9)}`;

  protected readonly selectedOption = computed(() => {
    const currentValue = this.valueState();
    return (
      this.options().find(
        (option): option is DropdownOptionItem => option.type === 'item' && option.value === currentValue,
      ) ?? null
    );
  });

  protected readonly displayText = computed(() => {
    const selected = this.selectedOption();
    return selected ? selected.label : this.placeholder();
  });

  protected readonly hasSelection = computed(() => this.selectedOption() !== null);

  protected readonly listboxElement = viewChild<ElementRef<HTMLUListElement>>('listbox');
  protected readonly triggerElement = viewChild<ElementRef<HTMLDivElement>>('trigger');
  private readonly listboxTemplate = viewChild<TemplateRef<unknown>>('listboxTemplate');

  private overlayRef: OverlayRef | null = null;
  private backdropClickSubscription: Subscription | null = null;

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    const control = this.ngControl?.control;
    if (!control) {
      return;
    }

    this.controlInvalid.set(control.invalid);
    this.controlTouched.set(control.touched);
    this.controlDisabled.set(control.disabled);

    merge(control.statusChanges, control.valueChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.controlInvalid.set(control.invalid);
        this.controlTouched.set(control.touched);
        this.controlDisabled.set(control.disabled);
      });
  }

  ngOnDestroy(): void {
    this.closePanel();
  }

  writeValue(value: string): void {
    this.valueState.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.controlDisabled.set(isDisabled);
  }

  @HostListener('focusout', ['$event'])
  protected onFocusOut(event: FocusEvent): void {
    const relatedTarget = event.relatedTarget as HTMLElement | null;
    const overlayEl = this.overlayRef?.overlayElement;
    if (!this.elementRef.nativeElement.contains(relatedTarget) && !overlayEl?.contains(relatedTarget)) {
      this.closePanel();
      this.markTouched();
    }
  }

  protected onPanelFocusOut(event: FocusEvent): void {
    const relatedTarget = event.relatedTarget as HTMLElement | null;
    const overlayEl = this.overlayRef?.overlayElement;
    if (
      !relatedTarget ||
      (!this.elementRef.nativeElement.contains(relatedTarget) && !overlayEl?.contains(relatedTarget))
    ) {
      this.closePanel();
      this.markTouched();
    }
  }

  toggleDropdown(): void {
    if (this.effectiveDisabled()) {
      return;
    }
    if (this.isOpen()) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  selectOption(option: DropdownOptionItem): void {
    if (option.disabled) {
      return;
    }
    this.valueState.set(option.value);
    this.onChange(option.value);
    this.valueChange.emit(option.value);
    this.closePanel();
    this.markTouched();
    this.triggerElement()?.nativeElement.focus();
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.effectiveDisabled()) {
      return;
    }

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.toggleDropdown();
        break;
      case 'Escape':
        this.closePanel();
        this.triggerElement()?.nativeElement.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen()) {
          this.openPanel();
        } else {
          this.focusNextOption(1);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (this.isOpen()) {
          this.focusNextOption(-1);
        }
        break;
      case 'Home':
        if (this.isOpen()) {
          event.preventDefault();
          this.focusOptionAtIndex(0);
        }
        break;
      case 'End':
        if (this.isOpen()) {
          event.preventDefault();
          this.focusOptionAtIndex(-1);
        }
        break;
      default:
        if (this.isOpen() && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          this.handleTypeahead(event.key);
        }
    }
  }

  protected onListboxKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        // Handled by individual option (keydown.enter) / (keydown.space) bindings
        break;
      case 'Escape':
        event.preventDefault();
        this.closePanel();
        this.triggerElement()?.nativeElement.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.focusNextOption(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusNextOption(-1);
        break;
      case 'Home':
        event.preventDefault();
        this.focusOptionAtIndex(0);
        break;
      case 'End':
        event.preventDefault();
        this.focusOptionAtIndex(-1);
        break;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          this.handleTypeahead(event.key);
        }
    }
  }

  private openPanel(): void {
    if (this.overlayRef) {
      return;
    }
    const template = this.listboxTemplate();
    if (!template) {
      return;
    }
    const anchorEl = this.elementRef.nativeElement as HTMLElement;
    const positions: ConnectedPosition[] = [
      { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
      { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
      { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
      { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
    ];
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().flexibleConnectedTo(anchorEl).withPositions(positions).withPush(false),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      width: anchorEl.offsetWidth,
    });
    const portal = new TemplatePortal(template, this.viewContainerRef);
    this.overlayRef.attach(portal);
    this.backdropClickSubscription = this.overlayRef.backdropClick().subscribe(() => {
      this.closePanel();
      this.markTouched();
    });
    this.isOpen.set(true);
  }

  private closePanel(): void {
    this.backdropClickSubscription?.unsubscribe();
    this.backdropClickSubscription = null;
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.isOpen.set(false);
  }

  private focusNextOption(direction: number): void {
    const listbox = this.listboxElement();
    if (!listbox) {
      return;
    }
    const items = Array.from(
      listbox.nativeElement.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])'),
    );
    const currentIndex = items.findIndex((item) => item === document.activeElement);
    const nextIndex = Math.max(0, Math.min(items.length - 1, currentIndex + direction));
    items[nextIndex]?.focus();
  }

  private focusOptionAtIndex(index: number): void {
    const listbox = this.listboxElement();
    if (!listbox) {
      return;
    }
    const items = Array.from(
      listbox.nativeElement.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])'),
    );
    const targetIndex = index === -1 ? items.length - 1 : index;
    items[targetIndex]?.focus();
  }

  private handleTypeahead(character: string): void {
    const listbox = this.listboxElement();
    if (!listbox) {
      return;
    }
    const optionElements = Array.from(
      listbox.nativeElement.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])'),
    );
    const matchingElement = optionElements.find((element) =>
      element.textContent?.trim().toLowerCase().startsWith(character.toLowerCase()),
    );
    if (matchingElement) {
      matchingElement.focus();
    }
  }

  protected markTouched(): void {
    this.onTouched();
    this.controlTouched.set(true);
  }
}

export type { DropdownOption, DropdownOptionItem, DropdownSize } from './dropdown.model';
