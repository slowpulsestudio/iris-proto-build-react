import { AppShell } from '../AppShell/AppShell.js';
import { Icon } from '../../components/Icon/Icon.js';
import styles from './IdentityPlaceholder.module.css';

export interface IdentityPlaceholderProps {
  /** Breadcrumb leaf + heading. */
  title: string;
  /** Library icon glyph. */
  icon: string;
  /** Value passed to `activeGlobalItem` for sidebar highlighting. */
  activeItem: string;
}

/**
 * IdentityPlaceholder — shared empty-state surface for Identity Manager
 * landing routes (Home, Insights). Content is intentionally empty this pass.
 */
export function IdentityPlaceholder({ title, icon, activeItem }: IdentityPlaceholderProps) {
  return (
    <AppShell breadcrumb={[{ label: title }]} activeGlobalItem={activeItem} showSecondarySidebar={false}>
      <div className={styles.empty}>
        <span className={styles.emptyIcon} aria-hidden="true">
          <Icon name={icon} size="32px" />
        </span>
        <h1 className={styles.emptyTitle}>{title}</h1>
        <p className={styles.emptyText}>Nothing here yet.</p>
      </div>
    </AppShell>
  );
}
