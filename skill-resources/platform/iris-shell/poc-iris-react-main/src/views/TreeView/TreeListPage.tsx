import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { AppShell } from '../AppShell/AppShell.js';
import { navigate } from '../../lib/router.js';
import { useAppShell } from '../../lib/appShellContext.js';
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
import { Menu, type MenuEntry } from '../../components/Menu/Menu.js';
import {
  Filters,
  fieldHasValueUi,
  type ActiveFilter,
  type FilterFieldConfig,
  type FilterOption,
} from '../../components/Filters/Filters.js';
import { DataTable, type DataTableColumn, type RowKey } from '../../components/DataTable/DataTable.js';
import { Pagination } from '../../components/Pagination/Pagination.js';
import { ActionBar } from '../../components/ActionBar/ActionBar.js';
import type { Crumb } from '../../components/AppHeader/AppHeader.js';
import { ResetPasswordModal } from '../UserDetailPage/ResetPasswordModal/ResetPasswordModal.js';
import { DeleteUserModal } from '../UserDetailPage/DeleteUserModal/DeleteUserModal.js';
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

/** Fields the user can add as filter chips (drives both menus + the chips). */
const FILTER_FIELDS: FilterFieldConfig[] = [
  { id: 'name', label: 'Name', placeholder: 'Select value' },
  { id: 'objectType', label: 'Object Type', placeholder: 'Select type', options: OBJECT_TYPE_OPTIONS },
  { id: 'location', label: 'Location', placeholder: 'Select location' },
  { id: 'dateCreated', label: 'Date created', type: 'date' },
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
  const { aiOpen } = useAppShell();
  const { isFavorite, toggle: toggleFavorite } = useFavorites();

  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [selected, setSelected] = useState<Set<RowKey>>(() => new Set());
  const [resetTarget, setResetTarget] = useState<DirectoryObject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DirectoryObject | null>(null);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterIdRef = useRef(0);

  // Reset transient view state when the selected node changes.
  useEffect(() => {
    setQuery('');
    setPage(1);
    setSelected(new Set());
    setActiveFilters([]);
  }, [nodeId]);

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

  const addFilter = (fieldId: string) => {
    filterIdRef.current += 1;
    setActiveFilters((prev) => [...prev, { id: `f${filterIdRef.current}`, fieldId }]);
  };
  const setFilterValue = (id: string, value: string) =>
    setActiveFilters((prev) => prev.map((f) => (f.id === id ? { ...f, value } : f)));
  const removeFilter = (id: string) =>
    setActiveFilters((prev) => prev.filter((f) => f.id !== id));
  const clearFilters = () => setActiveFilters([]);

  const filterMenuItems: MenuEntry[] = FILTER_FIELDS.map((f) => {
    const supported = fieldHasValueUi(f);
    return {
      kind: 'item',
      label: f.label,
      disabled: !supported,
      onSelect: supported ? () => addFilter(f.id) : undefined,
    };
  });

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
              items={CREATE_MENU_ITEMS}
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
              iconOnly: aiOpen,
              onClick: () => setSelected(new Set(allRows.map((o) => o.id))),
            },
            { icon: 'Copy', label: 'Copy', iconOnly: aiOpen, onClick: () => undefined },
            { icon: 'Folder', label: 'Move', iconOnly: aiOpen, onClick: () => undefined },
            { icon: 'UserList', label: 'Properties', iconOnly: aiOpen, onClick: () => undefined },
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

      {resetTarget && (
        <ResetPasswordModal open onClose={() => setResetTarget(null)} user={{ name: resetTarget.name }} />
      )}
      {deleteTarget && (
        <DeleteUserModal open onClose={() => setDeleteTarget(null)} user={{ name: deleteTarget.name }} />
      )}
    </AppShell>
  );
}
