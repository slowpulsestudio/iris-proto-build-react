import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { AppShell } from '../AppShell/AppShell.js';
import { navigate } from '../../lib/router.js';
import { useUsers } from '../../lib/usersStore.js';
import { useAppShell } from '../../lib/appShellContext.js';
import { isTypingTarget } from '../../lib/keyboard.js';
import { cx } from '../../lib/cx.js';
import { TextInput } from '../../components/TextInput/TextInput.js';
import { IconButton } from '../../components/IconButton/IconButton.js';
import { Icon } from '../../components/Icon/Icon.js';
import { Menu, type MenuEntry } from '../../components/Menu/Menu.js';
import {
  Filters,
  fieldHasValueUi,
  type ActiveFilter,
  type FilterFieldConfig,
  type FilterOption,
} from '../../components/Filters/Filters.js';
import { Button } from '../../components/Button/Button.js';
import { Badge, type BadgeTone } from '../../components/Badge/Badge.js';
import { Tooltip } from '../../components/Tooltip/Tooltip.js';
import { Link } from '../../components/Link/Link.js';
import { ContentHeader } from '../../components/ContentHeader/ContentHeader.js';
import { DataTable, type DataTableColumn, type RowKey } from '../../components/DataTable/DataTable.js';
import { Pagination } from '../../components/Pagination/Pagination.js';
import { ActionBar } from '../../components/ActionBar/ActionBar.js';
import { ResetPasswordModal } from '../UserDetailPage/ResetPasswordModal/ResetPasswordModal.js';
import { DeleteUserModal } from '../UserDetailPage/DeleteUserModal/DeleteUserModal.js';
import { CreateObjectModal } from './CreateObjectModal/CreateObjectModal.js';
import type { User } from './mockUsers.js';
import styles from './UsersPage.module.css';

/** Map a status string to its badge tone + icon. Unknown statuses fall back
 *  to a neutral question mark so the column never breaks visually. */
function statusBadge(status: string): { tone: BadgeTone; icon: string } {
  switch (status.toLowerCase()) {
    case 'active':
      return { tone: 'success', icon: 'CheckCircle' };
    case 'inactive':
    case 'disabled':
      return { tone: 'error', icon: 'XCircle' };
    case 'unknown':
    case 'pending':
      return { tone: 'warning', icon: 'WarningCircle' };
    default:
      return { tone: 'neutral', icon: 'Question' };
  }
}

/** Copy → Check icon swap for the Object ID copy action — two icons in one
 *  slot that cross-fade when `copied` flips (mirrors the reset-password and
 *  AI-panel copy affordances). */
function CopyCheckSwap({ copied }: { copied: boolean }) {
  return (
    <span
      className={styles.copySwap}
      data-copied={copied ? 'true' : 'false'}
      aria-hidden="true"
    >
      <span className={cx(styles.copySwapLayer, styles.copySwapCopy)}>
        <Icon name="Copy" size="16px" />
      </span>
      <span className={cx(styles.copySwapLayer, styles.copySwapCheck)}>
        <Icon name="CheckCircle" size="16px" />
      </span>
    </span>
  );
}

/** Object ID copy button with a transient "copied" confirmation. Lives as its
 *  own component so each row keeps independent copy state (the columns are
 *  defined at module scope and can't hold hooks). */
function CopyObjectIdButton({ objectId, userName }: { objectId: string; userName: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const handleCopy = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    // Clipboard API first; fall back to a hidden textarea for insecure
    // contexts. Feedback is best-effort — acknowledge the click regardless.
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(objectId);
      } else {
        throw new Error('clipboard-unavailable');
      }
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = objectId;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        /* both paths failed */
      }
    }
    setCopied(true);
  };

  return (
    <IconButton
      icon={<CopyCheckSwap copied={copied} />}
      ariaLabel={copied ? 'Object ID copied' : `Copy Object ID for ${userName}`}
      size="s"
      className={cx(styles.copyBtn, copied && styles.copyBtnDone)}
      onClick={handleCopy}
    />
  );
}

const COLUMNS: DataTableColumn<User>[] = [
  {
    key: 'name',
    header: 'Name',
    icon: 'IdentificationCard',
    width: '180px',
    cell: (u) => (
      <Link
        href={`#/users/${u.id}`}
        className={styles.nameCell}
        onClick={(e: MouseEvent<HTMLAnchorElement>) => {
          e.preventDefault();
          navigate(`#/users/${u.id}`);
        }}
      >
        {u.name}
      </Link>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    icon: 'UserCircleCheck',
    width: '128px',
    cell: (u) => {
      const { tone, icon } = statusBadge(u.status);
      return (
        <Badge tone={tone} icon={icon}>
          {u.status}
        </Badge>
      );
    },
  },
  {
    key: 'description',
    header: 'Description',
    icon: 'ArticleNyTimes',
    minWidth: '224px',
    maxWidth: '480px',
    grow: 2,
    cell: (u) => <span title={u.description}>{u.description}</span>,
  },
  {
    key: 'email',
    header: 'Email',
    icon: 'Envelope',
    width: '200px',
    cell: (u) => (
      <Link href={`mailto:${u.email}`} title={u.email} className={styles.emailCell}>
        {u.email}
      </Link>
    ),
  },
  {
    key: 'objectId',
    header: 'Object ID',
    icon: 'Tag',
    minWidth: '246px',
    maxWidth: '360px',
    grow: 1,
    cell: (u) => (
      <span className={styles.objectIdCell}>
        <span className={cx(styles.mono, styles.objectIdValue)} title={u.objectId}>
          {u.objectId}
        </span>
        <CopyObjectIdButton objectId={u.objectId} userName={u.name} />
      </span>
    ),
  },
];

/** Object types a user can filter by, mirroring the Create menu's icons. */
const OBJECT_TYPE_OPTIONS: FilterOption[] = [
  { value: 'ou', label: 'Organizational Unit', icon: 'FolderPlus' },
  { value: 'user', label: 'User', icon: 'User' },
  { value: 'computer', label: 'Computer', icon: 'Devices' },
  { value: 'group', label: 'Group', icon: 'UsersThree' },
  { value: 'sharedFolder', label: 'Shared folder', icon: 'Folders' },
  { value: 'contact', label: 'Contact', icon: 'AddressBook' },
  { value: 'gmsa', label: 'Group Management Service Account', icon: 'UserCircle' },
];

/** Fields the user can add as filter chips (drives both menus + the chips). */
const FILTER_FIELDS: FilterFieldConfig[] = [
  { id: 'displayName', label: 'Display Name', placeholder: 'Select value' },
  { id: 'objectType', label: 'Object Type', placeholder: 'Select type', options: OBJECT_TYPE_OPTIONS },
  { id: 'tags', label: 'Tags', placeholder: 'Select tag' },
  { id: 'location', label: 'Location', placeholder: 'Select location' },
  { id: 'dateActive', label: 'Date active', type: 'date' },
  { id: 'dateCreated', label: 'Date created', type: 'date' },
];

/** Page-level actions shown in the heading's overflow menu. */
const PAGE_ACTIONS_MENU_ITEMS: MenuEntry[] = [
  { kind: 'item', label: 'Export CSV', icon: 'Export' },
  { kind: 'divider' },
  { kind: 'item', label: 'Customize', icon: 'Pencil' },
  { kind: 'item', label: 'Add page to favorites', icon: 'Star' },
];

/** Items-per-page choices offered below the users table. */
const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];

const ADD_USER_MENU_ITEMS: MenuEntry[] = [
  { kind: 'item', label: 'User', icon: 'User' },
  { kind: 'item', label: 'Group', icon: 'UsersThree' },
  { kind: 'divider' },
  { kind: 'item', label: 'Computer', icon: 'Devices' },
  { kind: 'divider' },
  { kind: 'item', label: 'Organizational Unit', icon: 'FolderPlus' },
  { kind: 'item', label: 'Shared Folder', icon: 'Folders' },
  { kind: 'divider' },
  { kind: 'item', label: 'Contact', icon: 'AddressBook' },
  { kind: 'item', label: 'Group Management Service Account', icon: 'UserCircle' },
];

/**
 * UsersPage — the Directory Management → Users listing view.
 */
export function UsersPage() {
  const { users } = useUsers();
  const { aiOpen, setAiOpen, setAiContext } = useAppShell();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);
  const [selected, setSelected] = useState<Set<RowKey>>(() => new Set());
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterIdRef = useRef(0);

  // Which user (if any) has a row-action modal open. `null` = closed.
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  // Which object type the Create flow is building. `null` = closed.
  const [createTarget, setCreateTarget] = useState<{ type: string; icon: string } | null>(null);

  /* ---- ⌘⇧F / Ctrl+Shift+F opens the Add filter menu ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        !e.repeat &&
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === 'f'
      ) {
        // Don't hijack the key while the user is typing in a field.
        if (isTypingTarget(e.target)) return;
        e.preventDefault();
        setFilterMenuOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const addFilter = (fieldId: string) => {
    filterIdRef.current += 1;
    setActiveFilters((prev) => [...prev, { id: `f${filterIdRef.current}`, fieldId }]);
  };
  const setFilterValue = (id: string, value: string) =>
    setActiveFilters((prev) => prev.map((f) => (f.id === id ? { ...f, value } : f)));
  const removeFilter = (id: string) =>
    setActiveFilters((prev) => prev.filter((f) => f.id !== id));
  const clearFilters = () => setActiveFilters([]);

  // Create-menu entries wired to open the multi-step create modal, keyed off
  // each item's label + icon.
  const createMenuItems: MenuEntry[] = ADD_USER_MENU_ITEMS.map((entry) =>
    entry.kind === 'item'
      ? {
          ...entry,
          onSelect: () => setCreateTarget({ type: entry.label, icon: entry.icon ?? 'User' }),
        }
      : entry,
  );

  const filterMenuItems: MenuEntry[] = FILTER_FIELDS.map((f) => {
    // Fields without a value-selection UI would produce a chip the user can't
    // configure, so disable them until that UI lands.
    const supported = fieldHasValueUi(f);
    return {
      kind: 'item',
      label: f.label,
      disabled: !supported,
      onSelect: supported ? () => addFilter(f.id) : undefined,
    };
  });

  const rows = useMemo<User[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.name, u.description, u.email, u.objectId].some((v) =>
        v.toLowerCase().includes(q),
      ),
    );
  }, [users, query]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageRows = useMemo<User[]>(
    () => rows.slice((safePage - 1) * pageSize, safePage * pageSize),
    [rows, safePage, pageSize],
  );

  // Changing the page size keeps the first currently-visible row in view so the
  // user isn't thrown to an unrelated part of the list (and never stranded on a
  // now-nonexistent page).
  const handlePageSizeChange = (nextSize: number) => {
    const firstVisibleIndex = (safePage - 1) * pageSize;
    setPageSize(nextSize);
    setPage(Math.floor(firstVisibleIndex / nextSize) + 1);
  };

  // Quick-action menu shown from each row's trailing "more" button. Reset
  // password and Delete open their respective modals; the rest are PoC no-ops.
  const rowMenuItems = (u: User): MenuEntry[] => [
    { kind: 'item', label: 'Reset Password', icon: 'Password', onSelect: () => setResetUser(u) },
    { kind: 'item', label: 'Copy', icon: 'Copy' },
    { kind: 'item', label: 'Move', icon: 'Folder' },
    { kind: 'item', label: 'Properties', icon: 'UserList' },
    { kind: 'divider' },
    { kind: 'item', label: 'Connections', icon: 'Plugs' },
    { kind: 'item', label: 'Managed Units', icon: 'Cube' },
    { kind: 'item', label: 'Memberships', icon: 'UsersThree' },
    { kind: 'item', label: 'Roles', icon: 'IdentificationBadge' },
    { kind: 'divider' },
    { kind: 'item', label: 'Deprovision', icon: 'Prohibit', danger: true },
    { kind: 'item', label: 'Deactivate', icon: 'XCircle', danger: true },
    { kind: 'item', label: 'Delete', icon: 'Trash', danger: true, onSelect: () => setDeleteUser(u) },
  ];

  return (
    <AppShell
      breadcrumb={[{ label: 'Directory Management' }, { label: 'Users' }]}
    >
      <ContentHeader
        icon="Users"
        title="Users"
        actions={
          <Menu
            ariaLabel="Page actions"
            align="end"
            items={PAGE_ACTIONS_MENU_ITEMS}
            trigger={({ ref, onClick, expanded }) => (
              <Tooltip label="More options">
                <IconButton
                  ref={ref as React.Ref<HTMLButtonElement>}
                  icon="DotsThree"
                  ariaLabel="Page actions"
                  aria-haspopup="menu"
                  aria-expanded={expanded}
                  onClick={onClick}
                />
              </Tooltip>
            )}
          />
        }
        search={
          <TextInput
            iconLead="MagnifyingGlass"
            placeholder="Search by name, email, object ID etc."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            aria-label="Search users"
          />
        }
        toolbarActions={
          <>
            <span className={styles.toolbarSeparator} aria-hidden="true" />
            <Menu
              ariaLabel="Filter by"
              align="end"
              items={filterMenuItems}
              open={filterMenuOpen}
              onOpenChange={setFilterMenuOpen}
              trigger={({ ref, onClick, expanded }) => (
                <Tooltip label="Add filter" shortcut={['⌘', '⇧', 'F']}>
                  <Button
                    ref={ref as React.Ref<HTMLButtonElement>}
                    iconLead="FunnelSimple"
                    variant="secondary"
                    aria-haspopup="menu"
                    aria-expanded={expanded}
                    onClick={onClick}
                  >
                    Filter
                  </Button>
                </Tooltip>
              )}
            />
            <Menu
              ariaLabel="Create options"
              align="end"
              items={createMenuItems}
              trigger={({ ref, onClick, expanded }) => (
                <Button
                  ref={ref as React.Ref<HTMLButtonElement>}
                  variant="primary"
                  iconLead="Plus"
                  iconTrail="CaretDown"
                  className={styles.addBtn}
                  aria-haspopup="menu"
                  aria-expanded={expanded}
                  onClick={onClick}
                >
                  Create
                </Button>
              )}
            />
          </>
        }
        filters={
          activeFilters.length > 0 ? (
            <Filters
              filters={activeFilters}
              fields={FILTER_FIELDS}
              onAddFilter={addFilter}
              onValueChange={setFilterValue}
              onRemove={removeFilter}
              onClear={clearFilters}
            />
          ) : undefined
        }
      />

      <div className={styles.tableWrap}>
        <DataTable
          rows={pageRows}
          columns={COLUMNS}
          ariaLabel="Users"
          selected={selected}
          onSelectionChange={setSelected}
          rowLabel={(u) => u.name}
          rowActions={(u) => (
            <Menu
              ariaLabel={`Actions for ${u.name}`}
              align="end"
              items={rowMenuItems(u)}
              trigger={({ ref, onClick, expanded }) => (
                <IconButton
                  ref={ref as React.Ref<HTMLButtonElement>}
                  icon="DotsThree"
                  ariaLabel={`Actions for ${u.name}`}
                  size="s"
                  aria-haspopup="menu"
                  aria-expanded={expanded}
                  onClick={onClick}
                />
              )}
            />
          )}
          emptyState={
            query
              ? {
                  title: 'No matching users',
                  description: `No users match “${query}”.`,
                  actionLabel: 'Clear search',
                  onAction: () => {
                    setQuery('');
                    setPage(1);
                  },
                }
              : { title: 'No users yet', description: 'Add your first user to get started.' }
          }
        />
      </div>

      {pageCount > 1 && (
        <div className={styles.pagination}>
          <Pagination
            page={safePage}
            pageCount={pageCount}
            onPageChange={setPage}
            pageSize={pageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageSizeChange={handlePageSizeChange}
            ariaLabel="Users pages"
          />
        </div>
      )}

      <ActionBar
        open={selected.size > 0}
        selectedCount={selected.size}
        totalCount={users.length}
        layout="inline"
        onDismiss={() => setSelected(new Set())}
        groups={[
          [
            {
              icon: 'SelectionAll',
              label: 'Select all',
              iconOnly: aiOpen,
              onClick: () => setSelected(new Set(users.map((u) => u.id))),
            },
            { icon: 'Copy', label: 'Copy', iconOnly: aiOpen, onClick: () => undefined },
            { icon: 'Folder', label: 'Move', iconOnly: aiOpen, onClick: () => undefined },
            { icon: 'UserList', label: 'Properties', iconOnly: aiOpen, onClick: () => undefined },
            {
              icon: 'Sparkle',
              label: 'Ask AI',
              tone: 'brand',
              beam: true,
              onClick: () => {
                setAiContext(
                  [...selected].flatMap((id) => {
                    const u = users.find((x) => x.id === id);
                    return u ? [{ kind: 'user' as const, id: u.id, label: u.name }] : [];
                  }),
                );
                setAiOpen(true);
              },
            },
          ],
          [
            {
              icon: 'Trash',
              label: 'Delete',
              tone: 'danger',
              iconOnly: aiOpen,
              onClick: () => undefined,
            },
          ],
        ]}
      />

      {resetUser && (
        <ResetPasswordModal open onClose={() => setResetUser(null)} user={resetUser} />
      )}
      {deleteUser && (
        <DeleteUserModal open onClose={() => setDeleteUser(null)} user={deleteUser} />
      )}
      {createTarget && (
        <CreateObjectModal
          open
          onClose={() => setCreateTarget(null)}
          objectType={createTarget.type}
          icon={createTarget.icon}
        />
      )}
    </AppShell>
  );
}
