import { useEffect, useState, type MouseEvent, type Ref } from 'react';
import { AppShell } from '../AppShell/AppShell.js';
import { navigate } from '../../lib/router.js';
import { useUsers, type UserPatch } from '../../lib/usersStore.js';
import { isTypingTarget } from '../../lib/keyboard.js';
import { Tabs } from '../../components/Tabs/Tabs.js';
import { ContentHeader } from '../../components/ContentHeader/ContentHeader.js';
import { IconButton } from '../../components/IconButton/IconButton.js';
import { Button } from '../../components/Button/Button.js';
import { Card } from '../../components/Card/Card.js';
import { DescriptionList } from '../../components/DescriptionList/DescriptionList.js';
import { Link, type LinkTone } from '../../components/Link/Link.js';
import { Menu } from '../../components/Menu/Menu.js';
import { Tooltip } from '../../components/Tooltip/Tooltip.js';
import { EditPropertiesSheet } from './EditPropertiesSheet.js';
import { ResetPasswordModal } from './ResetPasswordModal/ResetPasswordModal.js';
import { DeleteUserModal } from './DeleteUserModal/DeleteUserModal.js';
import type { User } from '../UsersPage/mockUsers.js';
import styles from './UserDetailPage.module.css';

const TABS = [
  { value: 'overview', label: 'Overview', icon: 'Briefcase' },
  { value: 'profile', label: 'Profile', icon: 'IdentificationCard' },
  { value: 'certificates', label: 'Certificates', icon: 'Certificate' },
  { value: 'history', label: 'History', icon: 'ClockCounterClockwise' },
];

export interface UserDetailPageProps {
  userId: string;
}

/**
 * UserDetailPage — single-user view rendered inside the AppShell.
 *
 * Falls back to a "not found" panel if the id can't be resolved.
 */
export function UserDetailPage({ userId }: UserDetailPageProps) {
  const { users, getUser, getUserIndex, updateUser } = useUsers();
  const user = getUser(userId);
  const [tab, setTab] = useState('overview');
  const [editOpen, setEditOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  /* ---- ⌘E / Ctrl+E opens the Edit properties sheet ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.repeat && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
        // Don't hijack the key while the user is typing in a field.
        if (isTypingTarget(e.target)) return;
        e.preventDefault();
        setEditOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* ---- J / K jump to the next / previous user (Gmail/GitHub style) ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      // Don't hijack the keys while the user is typing in a field.
      if (isTypingTarget(e.target)) return;
      // Don't navigate away while a modal dialog (edit sheet, reset-password
      // modal) or a menu is open — those trap focus and own the interaction.
      if (document.querySelector('[aria-modal="true"], [role="menu"]')) return;
      const key = e.key.toLowerCase();
      if (key !== 'j' && key !== 'k') return;
      const i = getUserIndex(userId);
      if (i < 0) return;
      const target = key === 'j' ? users[i + 1] : users[i - 1];
      if (target) {
        e.preventDefault();
        navigate(`#/users/${target.id}`);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [users, userId, getUserIndex]);

  if (!user) {
    return (
      <AppShell
        breadcrumb={[
          { label: 'Directory Management' },
          { label: 'Users', onClick: () => navigate('#/users') },
          { label: 'Not found' },
        ]}
      >
        <div className={styles.missing}>
          <h1 className={styles.missingTitle}>User not found</h1>
          <p className={styles.missingBody}>
            We couldn’t find a user with id <code>{userId}</code>.
          </p>
          <Button variant="secondary" onClick={() => navigate('#/users')}>
            Back to Users
          </Button>
        </div>
      </AppShell>
    );
  }

  const idx = getUserIndex(userId);
  const prevUser = users[idx - 1] ?? null;
  const nextUser = users[idx + 1] ?? null;
  const d = user.details;

  return (
    <AppShell
      breadcrumb={[
        { label: 'Directory Management' },
        { label: 'Users', onClick: () => navigate('#/users') },
        { label: user.name },
      ]}
    >
      <ContentHeader
        variant="detail"
        icon="IdentificationCard"
        iconLabel={`${user.name} avatar`}
        title={
          <>
            {user.name} <span className={styles.titleAlias}>({d.displayName})</span>
          </>
        }
        subtitle={d.login}
        onBack={() => navigate('#/users')}
        backLabel="Back to Users"
        actions={
          <>
            <Tooltip label="Previous user" shortcut={['K']}>
              <IconButton
                icon="CaretDown"
                ariaLabel="Previous user"
                onClick={() => prevUser && navigate(`#/users/${prevUser.id}`)}
                disabled={!prevUser}
              />
            </Tooltip>
            <Tooltip label="Next user" shortcut={['J']}>
              <IconButton
                icon="CaretUp"
                ariaLabel="Next user"
                onClick={() => nextUser && navigate(`#/users/${nextUser.id}`)}
                disabled={!nextUser}
              />
            </Tooltip>
            <Menu
              ariaLabel="User actions"
              align="end"
              items={[
                { kind: 'item', label: 'Reset password', icon: 'Password', onSelect: () => setResetOpen(true) },
                { kind: 'item', label: 'Delete', icon: 'Trash', danger: true, onSelect: () => setDeleteOpen(true) },
              ]}
              trigger={({ ref, onClick, expanded }) => (
                <IconButton
                  ref={ref as Ref<HTMLButtonElement>}
                  icon="DotsThree"
                  ariaLabel="User actions"
                  aria-haspopup="menu"
                  aria-expanded={expanded}
                  onClick={onClick}
                />
              )}
            />
          </>
        }
        tabs={<Tabs items={TABS} value={tab} onChange={setTab} ariaLabel="User detail sections" />}
      />

      <div className={styles.content}>
        {tab === 'overview' && (
          <OverviewTab
            user={user}
            onEdit={() => setEditOpen(true)}
            onReset={() => setResetOpen(true)}
            onDelete={() => setDeleteOpen(true)}
          />
        )}
        {tab !== 'overview' && (
          <Card title={TABS.find((t) => t.value === tab)?.label}>
            <p className={styles.placeholder}>Coming soon.</p>
          </Card>
        )}
      </div>

      <EditPropertiesSheet
        open={editOpen}
        user={user}
        onClose={() => setEditOpen(false)}
        onSave={(patch: UserPatch) => updateUser(user.id, patch)}
      />

      <ResetPasswordModal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        user={user}
      />

      <DeleteUserModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        user={user}
      />
    </AppShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Overview tab — properties card + 3-up settings cards              */
/* ------------------------------------------------------------------ */

interface OverviewTabProps {
  user: User;
  onEdit: () => void;
  onReset: () => void;
  onDelete: () => void;
}

function OverviewTab({ user, onEdit, onReset, onDelete }: OverviewTabProps) {
  const d = user.details;

  const properties = [
    { label: 'Full Name', value: d.fullName },
    { label: 'Display name', value: d.displayName },
    { label: 'Initials', value: d.initials },
    { label: 'Description', value: d.longDescription },
  ];

  return (
    <div className={styles.overview}>
      <Card
        title="Properties"
        helper="Manage user authentication protocols, credential resets, and session tokens."
        actions={
          <Tooltip label="Edit properties" shortcut={['⌘', 'E']}>
            <Button variant="secondary" size="s" onClick={onEdit}>
              Edit
            </Button>
          </Tooltip>
        }
      >
        <DescriptionList items={properties} />
      </Card>

      <div className={styles.cardGrid}>
        <Card
          title="Account security & identity"
          helper="Manage user authentication protocols, credential resets, and session tokens."
        >
          <LinkList
            links={[
              { label: 'Reset password', onClick: onReset },
              { label: 'Reset Entra ID MFA', disabled: true },
              { label: 'Revoke Sessions', disabled: true },
            ]}
          />
        </Card>

        <Card
          title="Management & organization"
          helper="Reallocate, duplicate, or adjust the placement of this resource."
        >
          <LinkList
            links={[
              { label: 'Move', disabled: true },
              { label: 'Copy', disabled: true },
            ]}
          />
        </Card>

        <Card
          title="Danger zone"
          helper="Permanently remove, deactivate, or deprovision this resource."
        >
          <LinkList
            tone="danger"
            links={[
              { label: 'Deactivate', disabled: true },
              { label: 'Deprovision', disabled: true },
              { label: 'Delete', onClick: onDelete },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}

interface LinkEntry {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

interface LinkListProps {
  links: LinkEntry[];
  tone?: LinkTone;
}

function LinkList({ links, tone = 'brand' }: LinkListProps) {
  return (
    <ul className={styles.linkList}>
      {links.map((l) => (
        <li key={l.label} className={styles.linkRow}>
          <Link
            href="#"
            tone={tone}
            className={l.disabled ? styles.linkDisabled : undefined}
            aria-disabled={l.disabled || undefined}
            tabIndex={l.disabled ? -1 : undefined}
            onClick={(e: MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault();
              if (l.disabled) return;
              l.onClick?.();
            }}
          >
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
