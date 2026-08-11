import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react';
import { Button } from '../../../components/Button/Button.js';
import { Icon } from '../../../components/Icon/Icon.js';
import { Modal } from '../../../components/Modal/Modal.js';
import { TextInput } from '../../../components/TextInput/TextInput.js';
import { useShake } from '../../../lib/useShake.js';
import styles from './DeleteUserModal.module.css';

/** Any named object works — the modal only needs the name to confirm against. */
export interface DeleteTarget {
  name: string;
}

export interface DeleteUserModalProps {
  open: boolean;
  onClose: () => void;
  user: DeleteTarget;
  /** Called after the user confirms the (PoC) deletion. */
  onDeleted?: (user: DeleteTarget) => void;
}

/**
 * DeleteUserModal — destructive confirmation with a type-to-confirm guard.
 *
 * PoC only: nothing is actually deleted. Confirming requires the typed value
 * to exactly match the user's name; a mismatch shakes the field (p12 error
 * shake) and reveals an inline error. A match simply closes the modal (and
 * calls `onDeleted` for callers that want to react).
 */
export function DeleteUserModal({ open, onClose, user, onDeleted }: DeleteUserModalProps) {
  const inputId = useId();
  const helpId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [shakeRef, shake] = useShake<HTMLDivElement>();
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState(false);

  // Clear the field + error each time the modal re-opens.
  useEffect(() => {
    if (open) {
      setConfirmText('');
      setError(false);
    }
  }, [open]);

  // Exact (case-sensitive) match keeps the confirmation deliberate.
  const canDelete = confirmText.trim() === user.name;

  const handleDelete = () => {
    if (!canDelete) {
      setError(true);
      shake();
      inputRef.current?.focus();
      return;
    }
    onDeleted?.(user);
    onClose();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmText(e.target.value);
    // Typing is a correction — clear the error immediately.
    if (error) setError(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="s"
      className={styles.modal}
      title="Delete user"
      subtitle={
        <>
          Are you sure you want to delete the user <strong>{user.name}</strong>? This action cannot
          be undone.
        </>
      }
      leadingIcon={<DangerBadge />}
      iconPlacement="top"
      initialFocusRef={inputRef}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete User
          </Button>
        </>
      }
    >
      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor={inputId}>
          Please type <strong>{user.name}</strong> to confirm.
        </label>
        <div ref={shakeRef}>
          <TextInput
            id={inputId}
            ref={inputRef}
            placeholder="User"
            value={confirmText}
            onChange={handleChange}
            invalid={error}
            autoComplete="off"
            spellCheck={false}
            aria-describedby={helpId}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleDelete();
            }}
          />
        </div>
        <p id={helpId} className={styles.helpText}>
          I understand the consequences. This action is irreversible and will permanently remove all
          associated data.
        </p>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Red danger badge with a warning triangle, shown in the modal header.
// ---------------------------------------------------------------------------
function DangerBadge() {
  return (
    <span className={styles.dangerBadge} aria-hidden="true">
      <Icon name="Warning" size="24px" />
    </span>
  );
}
