import {
  useEffect,
  useId,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../../lib/cx.js';
import { Icon } from '../../../components/Icon/Icon.js';
import { IconButton } from '../../../components/IconButton/IconButton.js';
import { Button } from '../../../components/Button/Button.js';
import { TextInput } from '../../../components/TextInput/TextInput.js';
import { Checkbox } from '../../../components/Checkbox/Checkbox.js';
import { FormField } from '../../../components/FormField/FormField.js';
import { Stepper, type StepperStepItem } from '../../../components/Stepper/Stepper.js';
import styles from './CreateObjectModal.module.css';

export interface CreateObjectModalProps {
  open: boolean;
  onClose: () => void;
  /** Object kind being created, e.g. "User". Drives the header title. */
  objectType: string;
  /** Header featured-icon glyph (24px). */
  icon: string;
  /** Header subtitle — where the object will be created. */
  location?: string;
}

const STEPS: StepperStepItem[] = [
  { id: 'general', label: 'General' },
  { id: 'account', label: 'Account' },
];

interface GeneralForm {
  firstName: string;
  lastName: string;
  name: string;
  initials: string;
  displayName: string;
  userLogonName: string;
  suffix: string;
  preWindows2000: string;
}

interface AccountForm {
  password: string;
  confirmPassword: string;
  mustChange: boolean;
  cannotChange: boolean;
  neverExpires: boolean;
  inactive: boolean;
}

const EMPTY_GENERAL: GeneralForm = {
  firstName: '',
  lastName: '',
  name: '',
  initials: '',
  displayName: '',
  userLogonName: '',
  suffix: '',
  preWindows2000: '',
};

const EMPTY_ACCOUNT: AccountForm = {
  password: '',
  confirmPassword: '',
  mustChange: true,
  cannotChange: false,
  neverExpires: false,
  inactive: false,
};

const SIDEBAR = {
  title: 'Add new object',
  text: 'Manage identity and display names. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.',
};

/**
 * CreateObjectModal — two-step "New object" creation flow opened from the
 * Users page Create menu. Step 1 (General) collects identity fields; step 2
 * (Account) collects credentials + account options. Matches the Iris
 * new-object template: featured-icon header, inline Stepper, two-column body
 * with a contextual sidebar, and a split footer (step counter + primary CTA).
 */
export function CreateObjectModal({
  open,
  onClose,
  objectType,
  icon,
  location = 'Directory Management / Users',
}: CreateObjectModalProps) {
  const [step, setStep] = useState(0);
  const [general, setGeneral] = useState<GeneralForm>(EMPTY_GENERAL);
  const [account, setAccount] = useState<AccountForm>(EMPTY_ACCOUNT);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const titleId = useId();
  const [mounted, setMounted] = useState(open);

  // Reset the flow whenever the modal (re)opens.
  useEffect(() => {
    if (open) {
      setStep(0);
      setGeneral(EMPTY_GENERAL);
      setAccount(EMPTY_ACCOUNT);
    }
  }, [open]);

  // Keep mounted through the close transition.
  useEffect(() => {
    if (open) {
      setMounted(true);
      return undefined;
    }
    const t = setTimeout(() => setMounted(false), 200);
    return () => clearTimeout(t);
  }, [open]);

  useFocusTrap(open, dialogRef, firstFieldRef, onClose);

  if (!mounted) return null;

  const setG = (patch: Partial<GeneralForm>) => setGeneral((p) => ({ ...p, ...patch }));
  const setA = (patch: Partial<AccountForm>) => setAccount((p) => ({ ...p, ...patch }));

  // Prototype gating: enable the CTA as soon as any field has a value.
  const anyGeneralValue = Object.values(general).some((v) => v.trim() !== '');

  const isLast = step === 1;
  const ctaDisabled = isLast ? false : !anyGeneralValue;

  // Reached steps are clickable (go back). The next step also becomes
  // clickable (go forward) once the current step's CTA is enabled.
  const stepperSteps = STEPS.map((s, i) => ({
    ...s,
    disabled: i > step && !(i === step + 1 && !ctaDisabled),
  }));

  const handleCta = () => {
    if (isLast) {
      onClose();
    } else {
      setStep(1);
    }
  };

  return createPortal(
    <div className={cx(styles.scrim, open && styles.scrimOpen)} onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cx(styles.dialog, open && styles.dialogOpen)}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <span className={styles.featuredIcon} aria-hidden="true">
            <Icon name={icon} size="24px" />
          </span>
          <div className={styles.headerText}>
            <h2 id={titleId} className={styles.title}>{`New ${objectType}`}</h2>
            <p className={styles.subtitle}>{location}</p>
          </div>
          <IconButton
            icon="X"
            ariaLabel="Close"
            size="s"
            onClick={onClose}
            className={styles.closeBtn}
          />
        </header>

        <div className={styles.stepperWrap}>
          <Stepper
            steps={stepperSteps}
            activeIndex={step}
            interactive
            onStepSelect={(i) => setStep(i)}
            ariaLabel="Create object steps"
            className={styles.stepper}
          />
        </div>

        <div className={styles.body}>
          <div className={styles.bodyRow}>
            <div className={styles.content}>
              {/* Both steps stay mounted so the column keeps a constant height
                  (the taller General step) and can slide between the two. */}
              <div className={styles.pages} data-page={step}>
                <div className={styles.page} data-page-id="0" inert={step !== 0}>
                  <GeneralStep form={general} onChange={setG} firstFieldRef={firstFieldRef} />
                </div>
                <div className={styles.page} data-page-id="1" inert={step !== 1}>
                  <AccountStep form={account} onChange={setA} />
                </div>
              </div>
            </div>
            <aside className={styles.sidebar}>
              <p className={styles.sidebarTitle}>{SIDEBAR.title}</p>
              <p className={styles.sidebarText}>{SIDEBAR.text}</p>
            </aside>
          </div>
        </div>

        {/* Decorative column divider — positioned relative to the dialog so it
            starts at the stepper's top and isn't clipped by the scrolling body. */}
        <span className={styles.bodyDivider} aria-hidden="true" />

        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <span key={step} className={cx(styles.stepCounter, styles.swapIn)}>
              {`Step ${step + 1} of ${STEPS.length}`}
            </span>
            <Button variant="primary" disabled={ctaDisabled} onClick={handleCta}>
              <span key={isLast ? 'create' : 'continue'} className={styles.swapIn}>
                {isLast ? 'Create object' : 'Save and continue'}
              </span>
            </Button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

// ---------------------------------------------------------------------------
// Step 1 — General
// ---------------------------------------------------------------------------

interface GeneralStepProps {
  form: GeneralForm;
  onChange: (patch: Partial<GeneralForm>) => void;
  firstFieldRef: RefObject<HTMLInputElement | null>;
}

function GeneralStep({ form, onChange, firstFieldRef }: GeneralStepProps) {
  return (
    <>
      <div className={styles.row}>
        <div className={styles.col}>
          <FormField label="First name" required>
            <TextInput
              ref={firstFieldRef}
              value={form.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
              placeholder="Markus"
            />
          </FormField>
        </div>
        <div className={styles.col}>
          <FormField label="Last name" required>
            <TextInput
              value={form.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
              placeholder="Kim"
            />
          </FormField>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.col}>
          <FormField label="Name" required helperText="The object's canonical name.">
            <TextInput
              value={form.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="MKim"
            />
          </FormField>
        </div>
        <div className={styles.col}>
          <FormField label="Initials" helperText="Middle initials, if any.">
            <TextInput
              value={form.initials}
              onChange={(e) => onChange({ initials: e.target.value })}
              placeholder="MK"
            />
          </FormField>
        </div>
      </div>

      <div className={styles.rowFull}>
        <div className={styles.colFull}>
          <FormField label="Display name" required>
            <TextInput
              value={form.displayName}
              onChange={(e) => onChange({ displayName: e.target.value })}
              placeholder="Markus Kim"
            />
          </FormField>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.col}>
          <FormField label="User logon name" required>
            <TextInput
              value={form.userLogonName}
              onChange={(e) => onChange({ userLogonName: e.target.value })}
              placeholder="MKim@Entra1"
            />
          </FormField>
        </div>
        <div className={styles.col}>
          <FormField label="Suffix" required>
            <TextInput
              value={form.suffix}
              onChange={(e) => onChange({ suffix: e.target.value })}
              placeholder="@dom.net"
            />
          </FormField>
        </div>
      </div>

      <div className={styles.rowFull}>
        <div className={styles.colFull}>
          <FormField
            label="User logon name (pre-Windows 2000)"
            required
            helperText="Legacy down-level logon name."
          >
            <TextInput
              value={form.preWindows2000}
              onChange={(e) => onChange({ preWindows2000: e.target.value })}
              placeholder="MKim"
            />
          </FormField>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Step 2 — Account
// ---------------------------------------------------------------------------

const ACCOUNT_OPTIONS: { key: keyof AccountForm; label: string }[] = [
  { key: 'mustChange', label: 'User must change password at next logon' },
  { key: 'cannotChange', label: 'User cannot change password' },
  { key: 'neverExpires', label: 'Password never expires' },
  { key: 'inactive', label: 'Account is inactive' },
];

interface AccountStepProps {
  form: AccountForm;
  onChange: (patch: Partial<AccountForm>) => void;
}

function AccountStep({ form, onChange }: AccountStepProps) {
  return (
    <>
      <div className={styles.rowFull}>
        <PasswordField
          label="Password"
          value={form.password}
          onChange={(v) => onChange({ password: v })}
          hint="Use 8-16 characters with a mix of numbers and symbols"
          autoComplete="new-password"
        />
      </div>

      <div className={styles.rowFull}>
        <PasswordField
          label="Confirm password"
          value={form.confirmPassword}
          onChange={(v) => onChange({ confirmPassword: v })}
          autoComplete="new-password"
        />
      </div>

      <div className={styles.rowFull}>
        <div className={styles.optionsGroup}>
          <span className={styles.optionsLabel}>Account options</span>
          <div className={styles.optionsList}>
            {ACCOUNT_OPTIONS.map((opt) => (
              <label key={opt.key} className={styles.option}>
                <Checkbox
                  checked={form[opt.key] as boolean}
                  onChange={(checked) => onChange({ [opt.key]: checked } as Partial<AccountForm>)}
                />
                <span className={styles.optionText}>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  autoComplete?: string;
}

function PasswordField({ label, value, onChange, hint, autoComplete }: PasswordFieldProps) {
  const id = useId();
  const [show, setShow] = useState(false);
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.fieldLabel}>
        <span className={styles.labelName}>{label}</span>
        <span className={styles.labelReq}> (Required)</span>
      </label>
      <div className={styles.passwordControl}>
        <TextInput
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••••••"
          autoComplete={autoComplete}
          className={styles.passwordInput}
        />
        <IconButton
          icon={<EyeSwap revealed={show} />}
          ariaLabel={show ? 'Hide password' : 'Show password'}
          size="s"
          className={styles.eyeBtn}
          onClick={() => setShow((s) => !s)}
        />
      </div>
      {hint && <p className={styles.fieldHint}>{hint}</p>}
    </div>
  );
}

/** Eye ↔ EyeClosed cross-fade for the password reveal toggle (icon swap). */
function EyeSwap({ revealed }: { revealed: boolean }) {
  return (
    <span className={styles.iconSwap} data-alt={revealed ? 'true' : 'false'} aria-hidden="true">
      <span className={styles.iconSwapLayer}>
        <Icon name="Eye" size="16px" />
      </span>
      <span className={styles.iconSwapLayer}>
        <Icon name="EyeClosed" size="16px" />
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Focus trap + scroll lock + ESC — mirrors the shared Modal behavior.
// ---------------------------------------------------------------------------

function useFocusTrap(
  open: boolean,
  dialogRef: RefObject<HTMLElement | null>,
  initialFocusRef: RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = requestAnimationFrame(() => {
      const target =
        initialFocusRef.current ??
        dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      target?.focus();
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusables = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = originalOverflow;
      cancelAnimationFrame(focusTimer);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [open, dialogRef, initialFocusRef]);
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');
