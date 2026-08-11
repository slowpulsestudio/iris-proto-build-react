import { useEffect, useId, useState } from 'react';
import { cx } from '../../../lib/cx.js';
import { Button } from '../../../components/Button/Button.js';
import { Icon } from '../../../components/Icon/Icon.js';
import { IconButton } from '../../../components/IconButton/IconButton.js';
import { Modal } from '../../../components/Modal/Modal.js';
import { Tooltip } from '../../../components/Tooltip/Tooltip.js';
import styles from './ResetPasswordModal.module.css';

/** Any named object works — the modal only displays the name. */
export interface ResetTarget {
  name: string;
}

export interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  user: ResetTarget;
}

type Phase = 'confirm' | 'success';

/**
 * ResetPasswordModal — two-phase flow:
 *   1. confirm  → ask before resetting (plain header, no icon)
 *   2. success  → success badge header + readonly temp password (reveal + copy)
 */
export function ResetPasswordModal({ open, onClose, user }: ResetPasswordModalProps) {
  const [phase, setPhase] = useState<Phase>('confirm');
  const [password, setPassword] = useState('');

  // Reset to initial state each time the modal re-opens.
  useEffect(() => {
    if (open) {
      setPhase('confirm');
      setPassword('');
    }
  }, [open]);

  const handleReset = () => {
    setPassword(generatePassword());
    setPhase('success');
  };

  const isSuccess = phase === 'success';

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="s"
      className={styles.modal}
      title={isSuccess ? 'Password successfully reset' : 'Reset password'}
      subtitle={
        isSuccess ? (
          <>
            Provide this temporary password to the user <strong>{user.name}</strong> so they can
            sign in.
          </>
        ) : (
          user.name
        )
      }
      leadingIcon={isSuccess ? <SuccessBadge /> : undefined}
      iconPlacement="top"
      footer={
        isSuccess ? (
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleReset}>
              Reset password
            </Button>
          </>
        )
      }
    >
      {isSuccess ? (
        <PasswordField password={password} />
      ) : (
        <p className={styles.confirmBody}>
          The user <strong>{user.name}</strong> will be assigned a temporary password and will be
          required to change it upon next login.
        </p>
      )}
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Green "success" badge shown in the modal header on the success phase.
// The badge mounts fresh when the success phase appears, so the p10
// success-check appear transition (fade + rotate + blur + Y-bob + stroke
// draw) plays once on mount via the `data-state="in"` selector.
// ---------------------------------------------------------------------------
function SuccessBadge() {
  return (
    <span className={styles.tSuccessCheck} data-state="in" aria-hidden="true">
      <span className={styles.successBadge}>
        <Icon name="Check" size="24px" />
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Labelled readonly password field with reveal + copy actions.
// ---------------------------------------------------------------------------

interface PasswordFieldProps {
  password: string;
}

function PasswordField({ password }: PasswordFieldProps) {
  const inputId = useId();
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  // Clear the "Copied" badge after 2s.
  useEffect(() => {
    if (!copied) return undefined;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const handleCopy = async () => {
    // Try Clipboard API first; fall back to a hidden textarea for insecure
    // contexts. Surface the "Copied" feedback on best-effort — failures here
    // shouldn't block the user, who can still select + copy manually.
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(password);
      } else {
        throw new Error('clipboard-unavailable');
      }
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = password;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        // Both paths failed; still acknowledge the click below.
      }
    }
    setCopied(true);
  };

  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel} htmlFor={inputId}>
        Temporary password (expires in 7 days)
      </label>
      <div className={styles.pwdRow}>
        <input
          id={inputId}
          className={styles.pwdInput}
          readOnly
          type={visible ? 'text' : 'password'}
          value={password}
        />
        <Tooltip label={visible ? 'Hide password' : 'Show password'}>
          <IconButton
            icon={visible ? 'Eye' : 'EyeSlash'}
            ariaLabel={visible ? 'Hide password' : 'Show password'}
            size="s"
            onClick={() => setVisible((v) => !v)}
          />
        </Tooltip>
        <Tooltip label={copied ? 'Copied' : 'Copy password'}>
          <IconButton
            icon={<CopyPasswordSwap copied={copied} />}
            ariaLabel="Copy password"
            size="s"
            onClick={handleCopy}
            className={copied ? styles.copyDone : undefined}
          />
        </Tooltip>
      </div>
    </div>
  );
}

/** Copy → Check icon swap for the "Copy password" action — two icons in one
 *  slot that cross-fade with a blur + scale when `copied` flips. */
function CopyPasswordSwap({ copied }: { copied: boolean }) {
  return (
    <span
      className={styles.copySwap}
      data-copied={copied ? 'true' : 'false'}
      aria-hidden="true"
    >
      <span className={cx(styles.copySwapLayer, styles.copySwapCopy)}>
        <Icon name="CopySimple" size="16px" />
      </span>
      <span className={cx(styles.copySwapLayer, styles.copySwapCheck)}>
        <Icon name="CheckCircle" size="16px" />
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// PoC: generate a 12-char password from a printable alphabet.
// ---------------------------------------------------------------------------
function generatePassword(): string {
  const alphabet =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  const bytes = new Uint32Array(12);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}
