import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '../AppShell/AppShell.js';
import { navigate } from '../../lib/router.js';
import { isTypingTarget } from '../../lib/keyboard.js';
import { useDirectory } from '../../lib/directoryStore.js';
import { OBJECT_TYPE_META, type DirectoryObject } from '../../lib/directoryData.js';
import { useFavorites } from '../../lib/useFavorites.js';
import { Tabs } from '../../components/Tabs/Tabs.js';
import { ContentHeader } from '../../components/ContentHeader/ContentHeader.js';
import { IconButton } from '../../components/IconButton/IconButton.js';
import { Button } from '../../components/Button/Button.js';
import { Card } from '../../components/Card/Card.js';
import { DescriptionList, type DescriptionListItem } from '../../components/DescriptionList/DescriptionList.js';
import { Link, type LinkTone } from '../../components/Link/Link.js';
import { Tooltip } from '../../components/Tooltip/Tooltip.js';
import { Menu } from '../../components/Menu/Menu.js';
import type { Crumb } from '../../components/AppHeader/AppHeader.js';
import { ResetPasswordModal } from '../UserDetailPage/ResetPasswordModal/ResetPasswordModal.js';
import { DeleteUserModal } from '../UserDetailPage/DeleteUserModal/DeleteUserModal.js';
import { tabsForType, PRIMARY_TAB } from './detailTabs.js';
import styles from './TreeView.module.css';

export interface TreeDetailPageProps {
  nodeId: string;
  objectId: string;
}

/**
 * TreeDetailPage — a directory object's detail, reusing the UserDetailPage
 * scaffold with a type-driven tab set + an Object Management side panel.
 */
export function TreeDetailPage({ nodeId, objectId }: TreeDetailPageProps) {
  const { getObject, getSiblings, getPath, getNodeName } = useDirectory();
  const object = getObject(nodeId, objectId);
  const { isFavorite, toggle: toggleFavorite } = useFavorites();

  const [tab, setTab] = useState(PRIMARY_TAB);
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Reset to the primary tab whenever the object changes.
  useEffect(() => {
    setTab(PRIMARY_TAB);
  }, [objectId]);

  const siblings = getSiblings(nodeId);
  const idx = siblings.findIndex((s) => s.id === objectId);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;

  /* ---- J / K jump to prev / next sibling (like UserDetailPage) ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      if (isTypingTarget(e.target)) return;
      // Don't navigate while a modal or menu owns the interaction.
      if (document.querySelector('[aria-modal="true"], [role="menu"]')) return;
      const key = e.key.toLowerCase();
      if (key !== 'j' && key !== 'k') return;
      const target = key === 'j' ? next : prev;
      if (target) {
        e.preventDefault();
        navigate(`#/tree/${nodeId}/${target.id}`);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nodeId, prev, next]);

  const breadcrumb = useMemo<Crumb[]>(() => {
    const crumbs: Crumb[] = [{ label: 'Directory Management' }];
    crumbs.push({ label: '…' });
    crumbs.push({ label: getNodeName(nodeId) ?? 'Directory', onClick: () => navigate(`#/tree/${nodeId}`) });
    crumbs.push({ label: object?.name ?? 'Object' });
    return crumbs;
  }, [getNodeName, nodeId, object]);

  if (!object) {
    return (
      <AppShell breadcrumb={[{ label: 'Directory Management' }, { label: 'Not found' }]}>
        <div className={styles.missing}>
          <h1 className={styles.missingTitle}>Object not found</h1>
          <p className={styles.missingBody}>
            We couldn’t find an object <code>{objectId}</code> in this directory.
          </p>
          <Button variant="secondary" onClick={() => navigate(`#/tree/${nodeId}`)}>
            Back to Directory
          </Button>
        </div>
      </AppShell>
    );
  }

  const meta = OBJECT_TYPE_META[object.type];
  const pathTail = getPath(nodeId).slice(-2).map((n) => n.name).join(' / ');
  const tabs = tabsForType(object.type);
  const canReset = object.type === 'user' || object.type === 'contact';

  return (
    <AppShell breadcrumb={breadcrumb}>
      <ContentHeader
        variant="detail"
        icon={meta.icon}
        iconLabel={`${object.name} icon`}
        title={object.name}
        subtitle={
          <>
            {meta.label}
            {pathTail ? ` · ${pathTail}` : ''}
          </>
        }
        onBack={() => navigate(`#/tree/${nodeId}`)}
        backLabel="Back to directory"
        actions={
          <>
            <Tooltip label="Previous" shortcut={['K']}>
              <IconButton
                icon="CaretDown"
                ariaLabel="Previous object"
                onClick={() => prev && navigate(`#/tree/${nodeId}/${prev.id}`)}
                disabled={!prev}
              />
            </Tooltip>
            <Tooltip label="Next" shortcut={['J']}>
              <IconButton
                icon="CaretUp"
                ariaLabel="Next object"
                onClick={() => next && navigate(`#/tree/${nodeId}/${next.id}`)}
                disabled={!next}
              />
            </Tooltip>
            <Menu
              ariaLabel="Object actions"
              align="end"
              items={[
                ...(canReset
                  ? ([{ kind: 'item', label: 'Reset password', icon: 'Password', onSelect: () => setResetOpen(true) }] as const)
                  : []),
                {
                  kind: 'item',
                  label: isFavorite(object.id) ? 'Remove from favourites' : 'Add to favourites',
                  icon: 'Heart',
                  onSelect: () =>
                    toggleFavorite({
                      id: object.id,
                      name: object.name,
                      type: meta.label,
                      description: object.description,
                      href: `#/tree/${nodeId}/${object.id}`,
                    }),
                },
                { kind: 'item', label: 'Delete', icon: 'Trash', danger: true, onSelect: () => setDeleteOpen(true) },
              ]}
              trigger={({ ref, onClick, expanded }) => (
                <IconButton
                  ref={ref as React.Ref<HTMLButtonElement>}
                  icon="DotsThree"
                  ariaLabel="Object actions"
                  aria-haspopup="menu"
                  aria-expanded={expanded}
                  onClick={onClick}
                />
              )}
            />
          </>
        }
        tabs={<Tabs items={tabs} value={tab} onChange={setTab} ariaLabel="Object detail sections" />}
      />

      <div className={styles.content}>
        {tab === PRIMARY_TAB ? (
          <GeneralTab
            object={object}
            canReset={canReset}
            onReset={() => setResetOpen(true)}
            onDelete={() => setDeleteOpen(true)}
          />
        ) : (
          <Card title={tabs.find((t) => t.value === tab)?.label}>
            <p className={styles.placeholder}>Coming soon.</p>
          </Card>
        )}
      </div>

      {resetOpen && (
        <ResetPasswordModal open onClose={() => setResetOpen(false)} user={{ name: object.name }} />
      )}
      {deleteOpen && (
        <DeleteUserModal open onClose={() => setDeleteOpen(false)} user={{ name: object.name }} />
      )}
    </AppShell>
  );
}

/* ------------------------------------------------------------------ */
/*  General tab — properties + object management                      */
/* ------------------------------------------------------------------ */

interface GeneralTabProps {
  object: DirectoryObject;
  canReset: boolean;
  onReset: () => void;
  onDelete: () => void;
}

function GeneralTab({ object, canReset, onReset, onDelete }: GeneralTabProps) {
  const d = object.details;
  const isUser = object.type === 'user' || object.type === 'contact';

  const properties: DescriptionListItem[] = isUser
    ? [
        { label: 'First name', value: d.firstName ?? '—' },
        { label: 'Last name', value: d.lastName ?? '—' },
        { label: 'Display name', value: d.displayName ?? '—' },
        { label: 'User principle name', value: d.userPrincipalName ?? '—' },
        { label: 'Authorization info', value: d.authorizationInfo || '—' },
        { label: 'Description', value: d.description },
      ]
    : [
        { label: 'Name', value: object.name },
        { label: 'Type', value: OBJECT_TYPE_META[object.type].label },
        { label: 'Location', value: d.location ?? '—' },
        ...(d.memberCount != null ? [{ label: 'Members', value: String(d.memberCount) }] : []),
        { label: 'Created', value: d.created ?? '—' },
        { label: 'Description', value: d.description },
      ];

  return (
    <div className={styles.generalGrid}>
      <Card
        title="Properties"
        helper="Manage identity and display names."
        actions={
          <Button variant="secondary" size="s">
            Edit
          </Button>
        }
      >
        <DescriptionList items={properties} />
      </Card>

      <Card
        title="Object Management"
        helper="Manage this object's access, location, and restriction to the domain."
      >
        <div className={styles.linkGroups}>
          <LinkList
            links={[
              { label: 'Reset password', onClick: onReset, disabled: !canReset },
              { label: 'Reset Entra ID MFA', disabled: true },
              { label: 'Revoke Sessions', disabled: true },
            ]}
          />
          <LinkList
            links={[
              { label: 'Move', disabled: true },
              { label: 'Copy', disabled: true },
            ]}
          />
          <LinkList
            tone="danger"
            links={[
              { label: 'Deactivate', disabled: true },
              { label: 'Deprovision', disabled: true },
              { label: 'Delete', onClick: onDelete },
            ]}
          />
        </div>
      </Card>
    </div>
  );
}

interface LinkEntry {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

function LinkList({ links, tone = 'brand' }: { links: LinkEntry[]; tone?: LinkTone }) {
  return (
    <ul className={styles.linkList}>
      {links.map((l) => (
        <li key={l.label} className={styles.linkRow}>
          {l.disabled ? (
            <span className={styles.linkDisabled}>{l.label}</span>
          ) : (
            <Link
              href="#"
              tone={tone}
              onClick={(e) => {
                e.preventDefault();
                l.onClick?.();
              }}
            >
              {l.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
