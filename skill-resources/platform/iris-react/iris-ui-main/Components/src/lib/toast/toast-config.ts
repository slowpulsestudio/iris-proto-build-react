// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ToastType } from './toast.model';

export interface IrisToastConfig {
  /** Semantic type that determines icon and color. Defaults to 'info'. */
  type?: ToastType;
  /** Required heading text shown in bold. */
  title: string;
  /** Optional body copy shown below the title. */
  supportingText?: string;
  /** Whether the dismiss (×) button is shown. Defaults to true. */
  dismissible?: boolean;
  /**
   * Milliseconds before the toast is automatically dismissed.
   * Set to `null` to disable auto-dismiss. Defaults to 5000.
   * When `primaryActionLabel` or `secondaryActionLabel` is provided this defaults to `null`
   * so users have time to interact with the action buttons.
   */
  duration?: number | null;
  /** Accessible label for the dismiss button. Localise for non-English UIs. Defaults to 'Dismiss'. */
  dismissAriaLabel?: string;
  /** Screen-reader label prepended to the title for info toasts. Defaults to 'Info'. */
  infoAriaLabel?: string;
  /** Screen-reader label prepended to the title for warning toasts. Defaults to 'Warning'. */
  warningAriaLabel?: string;
  /** Screen-reader label prepended to the title for error toasts. Defaults to 'Error'. */
  errorAriaLabel?: string;
  /** Screen-reader label prepended to the title for success toasts. Defaults to 'Success'. */
  successAriaLabel?: string;
  /**
   * Label for the primary action button.
   * React to clicks via `IrisToastRef.afterPrimaryAction()`.
   */
  primaryActionLabel?: string;
  /**
   * Label for the secondary action button. Independent of `primaryActionLabel`.
   * React to clicks via `IrisToastRef.afterSecondaryAction()`.
   */
  secondaryActionLabel?: string;
}
