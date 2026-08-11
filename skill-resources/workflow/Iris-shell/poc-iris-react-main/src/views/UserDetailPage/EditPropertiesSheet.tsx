import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { SideSheet } from '../../components/SideSheet/SideSheet.js';
import { FormField } from '../../components/FormField/FormField.js';
import { TextInput } from '../../components/TextInput/TextInput.js';
import { Textarea } from '../../components/Textarea/Textarea.js';
import { Button } from '../../components/Button/Button.js';
import type { User } from '../UsersPage/mockUsers.js';
import type { UserPatch } from '../../lib/usersStore.js';
import styles from './EditPropertiesSheet.module.css';

interface Draft {
  firstName: string;
  lastName: string;
  displayName: string;
  initials: string;
  longDescription: string;
}

type DraftErrors = Partial<Record<keyof Draft, string>>;

export interface EditPropertiesSheetProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (patch: UserPatch) => void;
}

/**
 * EditPropertiesSheet — side-sheet form that edits a user's Properties card.
 *
 * Fields:
 *   - First name *      (details.firstName)
 *   - Last name *       (details.lastName)
 *   - Display name *    (details.displayName)
 *   - Initials *        (details.initials)
 *   - Description       (details.longDescription)  — textarea, optional
 *
 * On Save: validates required fields, calls `onSave(patch)` with a
 * `{ details: {...} }` patch, then closes.
 */
export function EditPropertiesSheet({ open, user, onClose, onSave }: EditPropertiesSheetProps) {
  const seed = useMemo<Draft>(() => seedFromUser(user), [user]);
  const [draft, setDraft] = useState<Draft>(seed);
  const [errors, setErrors] = useState<DraftErrors>({});
  // Bumped on a failed save so each invalid FormField replays its shake.
  const [shakeTrigger, setShakeTrigger] = useState(0);

  // Reset the draft whenever the sheet (re)opens or the target user changes.
  useEffect(() => {
    if (open) {
      setDraft(seed);
      setErrors({});
      setShakeTrigger(0);
    }
  }, [open, seed]);

  const setField =
    (key: keyof Draft) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDraft((d) => ({ ...d, [key]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(draft);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setShakeTrigger((n) => n + 1);
      return;
    }
    onSave({
      details: {
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        displayName: draft.displayName.trim(),
        initials: draft.initials.trim(),
        longDescription: draft.longDescription,
      },
    });
    onClose();
  };

  if (!user) return null;

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      title={`Edit ${user.details.fullName}’s property details`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.grid}>
          <FormField label="First name" required error={errors.firstName} shakeTrigger={shakeTrigger}>
            <TextInput
              value={draft.firstName}
              onChange={setField('firstName')}
              autoComplete="given-name"
            />
          </FormField>
          <FormField label="Last name" required error={errors.lastName} shakeTrigger={shakeTrigger}>
            <TextInput
              value={draft.lastName}
              onChange={setField('lastName')}
              autoComplete="family-name"
            />
          </FormField>
          <FormField label="Initials" required error={errors.initials} shakeTrigger={shakeTrigger}>
            <TextInput
              value={draft.initials}
              onChange={setField('initials')}
              maxLength={4}
            />
          </FormField>
          <FormField
            label="Display name"
            required
            error={errors.displayName}
            shakeTrigger={shakeTrigger}
          >
            <TextInput
              value={draft.displayName}
              onChange={setField('displayName')}
            />
          </FormField>
        </div>

        <FormField label="Description">
          <Textarea
            rows={6}
            value={draft.longDescription}
            onChange={setField('longDescription')}
          />
        </FormField>

        {/* Hidden submit so Enter saves the form. */}
        <button type="submit" hidden />
      </form>
    </SideSheet>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function seedFromUser(user: User | null): Draft {
  const d = user?.details;
  return {
    firstName: d?.firstName ?? '',
    lastName: d?.lastName ?? '',
    displayName: d?.displayName ?? '',
    initials: d?.initials ?? '',
    longDescription: d?.longDescription ?? '',
  };
}

function validate(d: Draft): DraftErrors {
  const e: DraftErrors = {};
  if (!d.firstName.trim()) e.firstName = 'Required';
  if (!d.lastName.trim()) e.lastName = 'Required';
  if (!d.displayName.trim()) e.displayName = 'Required';
  if (!d.initials.trim()) e.initials = 'Required';
  return e;
}
