import { AppShell } from '../AppShell/AppShell.js';
import { ContentHeader } from '../../components/ContentHeader/ContentHeader.js';
import { Icon } from '../../components/Icon/Icon.js';
import { navigate } from '../../lib/router.js';
import { findIdentitySection, identitySectionHash } from '../../lib/identityNav.js';
import styles from './IdentitySectionPage.module.css';

export interface IdentitySectionPageProps {
  groupId: string;
  itemValue: string;
}

/**
 * IdentitySectionPage — generic leaf surface for every Identity Manager nav
 * item (`#/identity/<group>/<item>`). Resolves the item from the shared
 * registry and renders an empty state with its delivery-status badge. No
 * per-item components exist yet; this is the placeholder for all of them.
 */
export function IdentitySectionPage({ groupId, itemValue }: IdentitySectionPageProps) {
  const section = findIdentitySection(groupId, itemValue);

  if (!section) {
    return (
      <AppShell
        breadcrumb={[{ label: 'Account home', onClick: () => navigate('#/identity') }, { label: 'Not found' }]}
        activeGlobalItem="home"
        showSecondarySidebar={false}
      >
        <div className={styles.empty}>
          <span className={styles.emptyIcon} aria-hidden="true">
            <Icon name="Compass" size="32px" />
          </span>
          <h1 className={styles.emptyTitle}>Section not found</h1>
          <p className={styles.emptyText}>
            This Identity Manager area doesn’t exist. Head back to the{' '}
            <button type="button" className={styles.link} onClick={() => navigate('#/identity')}>
              home
            </button>{' '}
            surface.
          </p>
        </div>
      </AppShell>
    );
  }

  const { group, item } = section;
  const status = item.status ?? 'web';
  const activeItem = identitySectionHash(group.id, item.value);

  return (
    <AppShell
      breadcrumb={[
        { label: 'Account home', onClick: () => navigate('#/identity') },
        { label: group.label },
        { label: item.label },
      ]}
      activeGlobalItem={activeItem}
      showSecondarySidebar={false}
    >
      <ContentHeader
        icon={item.icon}
        iconLabel={`${item.label} icon`}
        title={item.label}
      />

      <div className={styles.empty}>
        <span className={styles.emptyIcon} aria-hidden="true">
          <Icon name={item.icon} size="32px" />
        </span>
        <h2 className={styles.emptyTitle}>{item.label}</h2>
        <p className={styles.emptyText}>
          {status === 'web'
            ? 'This screen lives here in the unified shell. Content is coming soon.'
            : status === 'fat'
              ? 'This task still runs in the fat client for now. A web home is planned.'
              : 'This area is planned and not available yet.'}
        </p>
      </div>
    </AppShell>
  );
}
