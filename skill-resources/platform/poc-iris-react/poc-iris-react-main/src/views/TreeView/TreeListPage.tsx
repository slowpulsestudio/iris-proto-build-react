import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { AppShell } from '../AppShell/AppShell.js';
import { navigate } from '../../lib/router.js';
import { isTypingTarget } from '../../lib/keyboard.js';
import { useDirectory } from '../../lib/directoryStore.js';
import { OBJECT_TYPE_META, type DirectoryObject } from '../../lib/directoryData.js';
import { useFavorites } from '../../lib/useFavorites.js';
import { TextInput } from '../../components/TextInput/TextInput.js';
import { IconButton } from '../../components/IconButton/IconButton.js';
import { Icon } from '../../components/Icon/Icon.js';
import { Button } from '../../components/Button/Button.js';
import { Link } from '../../components/Link/Link.js';
import { Tooltip } from '../../components/Tooltip/Tooltip.js';
import { ContentHeader } from '../../components/ContentHeader/ContentHeader.js';
import { ListToolbarActions } from '../../components/ListToolbarActions/ListToolbarActions.js';
import { Menu, type MenuEntry } from '../../components/Menu/Menu.js';
import {
  FilterBar,
  useFilterModel,
  type FilterOption,
  type ParameterDef,
  type ParamCategory,
} from '../../components/Filters/index.js';
import { DataTable, type DataTableColumn, type RowKey } from '../../components/DataTable/DataTable.js';
import { Pagination } from '../../components/Pagination/Pagination.js';
import { ActionBar } from '../../components/ActionBar/ActionBar.js';
import type { Crumb } from '../../components/AppHeader/AppHeader.js';
import { ResetPasswordModal } from '../UserDetailPage/ResetPasswordModal/ResetPasswordModal.js';
import { DeleteUserModal } from '../UserDetailPage/DeleteUserModal/DeleteUserModal.js';
import { CreateObjectModal } from '../UsersPage/CreateObjectModal/CreateObjectModal.js';
import styles from './TreeView.module.css';

const PAGE_SIZE_OPTIONS = [15, 30, 50, 100];

const CREATE_MENU_ITEMS: MenuEntry[] = [
  { kind: 'item', label: 'User', icon: 'User' },
  { kind: 'item', label: 'Group', icon: 'UsersThree' },
  { kind: 'divider' },
  { kind: 'item', label: 'Computer', icon: 'Devices' },
  { kind: 'item', label: 'Organizational Unit', icon: 'FolderPlus' },
  { kind: 'item', label: 'Contact', icon: 'AddressBook' },
];

/** Object types offered in the "Object Type" filter. */
const OBJECT_TYPE_OPTIONS: FilterOption[] = [
  { value: 'ou', label: 'Organizational Unit', icon: 'Folder' },
  { value: 'user', label: 'User', icon: 'User' },
  { value: 'computer', label: 'Computer', icon: 'Devices' },
  { value: 'group', label: 'Group', icon: 'UsersThree' },
  { value: 'contact', label: 'Contact', icon: 'AddressBook' },
];

/** Fields the user can filter by (drives the toolbar menu, the builder and the pills). */
const PARAMETERS: ParameterDef[] = [
  { id: 'name', label: 'Name', icon: 'TextAa' },
  { id: 'objectType', label: 'Object type', icon: 'Cube', options: OBJECT_TYPE_OPTIONS },
  { id: 'location', label: 'Location', icon: 'MapPin' },
  { id: 'dateCreated', label: 'Date created', icon: 'CalendarDots', date: true },
];

/** Parameter groupings for the advanced builder's `+ Filter` popover (§3.8). */
const PARAM_CATEGORIES: ParamCategory[] = [
  { label: 'Common', parameterIds: ['name', 'objectType', 'location'] },
  { label: 'User', parameterIds: ['dateCreated'] },
];

/** Href for a row: containers drill in; leaves open detail. */
function hrefFor(obj: DirectoryObject, nodeId: string): string {
  return obj.isContainer ? `#/tree/${obj.id}` : `#/tree/${nodeId}/${obj.id}`;
}

export interface TreeListPageProps {
  nodeId: string;
}

/**
 * TreeListPage — contents of a directory node, rendered with the same table +
 * toolbar + ActionBar design as the Users listing (different columns + data).
 */
export function TreeListPage({ nodeId }: TreeListPageProps) {
  const { isContainer, getChildren, getPath, getNodeName, getNodeIcon } = useDirectory();
  const { isFavorite, toggle: toggleFavorite } = useFavorites();

  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [selected, setSelected] = useState<Set<RowKey>>(() => new Set());
  const [resetTarget, setResetTarget] = useState<DirectoryObject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DirectoryObject | null>(null);
  // Which object type the Create flow is building. `null` = closed.
  const [createTarget, setCreateTarget] = useState<{ type: string; icon: string } | null>(null);
  const { root, actions } = useFilterModel();
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  // Reset transient view state when the selected node changes.
  useEffect(() => {
    setQuery('');
    setPage(1);
    setSelected(new Set());
    actions.clear();
  }, [nodeId, actions]);

  /* ---- ⌘⇧F / Ctrl+Shift+F opens the Add filter menu ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        !e.repeat &&
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === 'f'
      ) {
        if (isTypingTarget(e.target)) return;
        e.preventDefault();
        setFilterMenuOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const addFilter = (parameterId: string) => {
    actions.addCondition(root.id, { parameterId });
  };
  const addAdvancedFilter = () => {
    actions.addGroup(root.id);
  };

  // Toolbar Filter menu (§3.6): Advanced filter + parameter quick-adds.
  const rootGroupCount = root.children.filter((c) => c.kind === 'group').length;
  const filterMenuItems: MenuEntry[] = [
    {
      kind: 'item',
      label: 'Advanced filter',
      icon: 'FunnelSimple',
      onSelect: addAdvancedFilter,
      disabled: rootGroupCount >= 6,
    },
    { kind: 'divider' },
    { kind: 'item', label: 'Name', onSelect: () => addFilter('name') },
    { kind: 'item', label: 'Object type', onSelect: () => addFilter('objectType') },
    { kind: 'item', label: 'Location', onSelect: () => addFilter('location') },
    { kind: 'item', label: 'Date created', onSelect: () => addFilter('dateCreated') },
  ];

  // Create-menu entries wired to open the shared multi-step create modal.
  const createMenuItems: MenuEntry[] = CREATE_MENU_ITEMS.map((entry) =>
    entry.kind === 'item'
      ? {
          ...entry,
          onSelect: () => setCreateTarget({ type: entry.label, icon: entry.icon ?? 'User' }),
        }
      : entry,
  );

  const nodeName = getNodeName(nodeId);
  const known = isContainer(nodeId);

  const allRows = useMemo<DirectoryObject[]>(
    () => (known ? getChildren(nodeId) : []),
    [known, getChildren, nodeId],
  );

  const rows = useMemo<DirectoryObject[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allRows;
    return allRows.filter((o) =>
      [o.name, OBJECT_TYPE_META[o.type].label, o.description].some((v) =>
        v.toLowerCase().includes(q),
      ),
    );
  }, [allRows, query]);

  const columns = useMemo<DataTableColumn<DirectoryObject>[]>(
    () => [
      {
        key: 'name',
        header: 'Name',
        icon: 'IdentificationCard',
        minWidth: '200px',
        grow: 1,
        cell: (o) => (
          <Link
            href={hrefFor(o, nodeId)}
            className={styles.nameCell}
            onClick={(e: MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault();
              navigate(hrefFor(o, nodeId));
            }}
          >
            <span className={styles.nameIcon} aria-hidden="true">
              <Icon name={OBJECT_TYPE_META[o.type].icon} size="16px" />
            </span>
            <span className={styles.nameText}>{o.name}</span>
          </Link>
        ),
      },
      {
        key: 'type',
        header: 'Object type',
        icon: 'Tag',
        width: '180px',
        cell: (o) => OBJECT_TYPE_META[o.type].label,
      },
      {
        key: 'description',
        header: 'Description',
        icon: 'ArticleNyTimes',
        minWidth: '240px',
        grow: 2,
        cell: (o) => <span title={o.description}>{o.description}</span>,
      },
    ],
    [nodeId],
  );

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageRows = useMemo<DirectoryObject[]>(
    () => rows.slice((safePage - 1) * pageSize, safePage * pageSize),
    [rows, safePage, pageSize],
  );

  const handlePageSizeChange = (nextSize: number) => {
    const firstVisibleIndex = (safePage - 1) * pageSize;
    setPageSize(nextSize);
    setPage(Math.floor(firstVisibleIndex / nextSize) + 1);
  };

  const rowMenuItems = (o: DirectoryObject): MenuEntry[] => {
    const canReset = o.type === 'user' || o.type === 'contact';
    const fav = isFavorite(o.id);
    return [
      ...(canReset
        ? ([{ kind: 'item', label: 'Reset Password', icon: 'Password', onSelect: () => setResetTarget(o) }] as MenuEntry[])
        : []),
      { kind: 'item', label: 'Copy', icon: 'Copy' },
      { kind: 'item', label: 'Move', icon: 'Folder' },
      { kind: 'item', label: 'Properties', icon: 'UserList' },
      {
        kind: 'item',
        label: fav ? 'Remove from favourites' : 'Add to favourites',
        icon: 'Heart',
        onSelect: () =>
          toggleFavorite({
            id: o.id,
            name: o.name,
            type: OBJECT_TYPE_META[o.type].label,
            description: o.description,
            href: hrefFor(o, nodeId),
          }),
      },
      { kind: 'divider' },
      { kind: 'item', label: 'Deprovision', icon: 'Prohibit', danger: true },
      { kind: 'item', label: 'Deactivate', icon: 'XCircle', danger: true },
      { kind: 'item', label: 'Delete', icon: 'Trash', danger: true, onSelect: () => setDeleteTarget(o) },
    ];
  };

  const breadcrumb = useMemo<Crumb[]>(() => {
    const path = getPath(nodeId);
    const crumbs: Crumb[] = [{ label: 'Directory Management' }];
    if (path.length > 1) crumbs.push({ label: '…' });
    const current = path[path.length - 1];
    crumbs.push({ label: current?.name ?? nodeName ?? 'Unknown' });
    return crumbs;
  }, [getPath, nodeId, nodeName]);

  if (!known) {
    return (
      <AppShell breadcrumb={[{ label: 'Directory Management' }, { label: 'Not found' }]}>
        <div className={styles.missing}>
          <h1 className={styles.missingTitle}>Directory not found</h1>
          <p className={styles.missingBody}>
            We couldn’t find a directory or folder with id <code>{nodeId}</code>.
          </p>
          <Button variant="secondary" onClick={() => navigate('#/tree')}>
            Back to Directory
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell breadcrumb={breadcrumb}>
      <ContentHeader
        icon={getNodeIcon(nodeId)}
        title={nodeName}
        actions={
          <Menu
            ariaLabel="Node actions"
            align="end"
            items={[
              { kind: 'item', label: 'Customize', icon: 'Pencil' },
              {
                kind: 'item',
                label: isFavorite(nodeId) ? 'Remove from favourites' : 'Add to favourites',
                icon: 'Heart',
                onSelect: () =>
                  toggleFavorite({
                    id: nodeId,
                    name: nodeName ?? 'Directory',
                    type: 'Folder',
                    href: `#/tree/${nodeId}`,
                  }),
              },
            ]}
            trigger={({ ref, onClick, expanded }) => (
              <Tooltip label="More options">
                <IconButton
                  ref={ref as React.Ref<HTMLButtonElement>}
                  icon="DotsThree"
                  ariaLabel="Node actions"
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
            aria-label="Search directory objects"
          />
        }
        toolbarActions={
          <ListToolbarActions
            filterMenuItems={filterMenuItems}
            filterMenuOpen={filterMenuOpen}
            onFilterOpenChange={setFilterMenuOpen}
            createMenuItems={createMenuItems}
            filterActive={root.children.length > 0}
          />
        }
        filters={
          root.children.length > 0 ? (
            <FilterBar
              root={root}
              parameters={PARAMETERS}
              categories={PARAM_CATEGORIES}
              actions={actions}
              addMenuItems={filterMenuItems}
            />
          ) : undefined
        }
      />

      <div className={styles.tableWrap}>
        <DataTable
          rows={pageRows}
          columns={columns}
          ariaLabel={`${nodeName} contents`}
          selected={selected}
          onSelectionChange={setSelected}
          rowLabel={(o) => o.name}
          rowActions={(o) => (
            <Menu
              ariaLabel={`Actions for ${o.name}`}
              align="end"
              items={rowMenuItems(o)}
              trigger={({ ref, onClick, expanded }) => (
                <IconButton
                  ref={ref as React.Ref<HTMLButtonElement>}
                  icon="DotsThree"
                  ariaLabel={`Actions for ${o.name}`}
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
                  title: 'No matching objects',
                  description: `No objects match “${query}”.`,
                  actionLabel: 'Clear search',
                  onAction: () => {
                    setQuery('');
                    setPage(1);
                  },
                }
              : { title: 'Empty folder', description: 'This directory has no objects.' }
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
            ariaLabel="Directory pages"
          />
        </div>
      )}

      <ActionBar
        open={selected.size > 0}
        selectedCount={selected.size}
        totalCount={allRows.length}
        layout="inline"
        onDismiss={() => setSelected(new Set())}
        groups={[
          [
            {
              icon: 'SelectionAll',
              label: 'Select all',
              onClick: () => setSelected(new Set(allRows.map((o) => o.id))),
            },
            { icon: 'Copy', label: 'Copy', onClick: () => undefined },
            { icon: 'Folder', label: 'Move', onClick: () => undefined },
            { icon: 'UserList', label: 'Properties', onClick: () => undefined },
          ],
          [
            {
              icon: 'Trash',
              label: 'Delete',
              tone: 'danger',
              onClick: () => undefined,
            },
          ],
        ]}
      />

      {resetTarget && (
        <ResetPasswordModal open onClose={() => setResetTarget(null)} user={{ name: resetTarget.name }} />
      )}
      {deleteTarget && (
        <DeleteUserModal open onClose={() => setDeleteTarget(null)} user={{ name: deleteTarget.name }} />
      )}
      {createTarget && (
        <CreateObjectModal
          open
          onClose={() => setCreateTarget(null)}
          objectType={createTarget.type}
          icon={createTarget.icon}
          location={`Directory Management / ${nodeName}`}
        />
      )}
    </AppShell>
  );
}
