import { AppShell } from '../AppShell/AppShell.js';
import styles from './IdentityManagerPage.module.css';

/**
 * IdentityManagerPage — Home surface for the Identity Manager vertical.
 * Hosted at `#/identity`. All sidebar items other than Home are disabled
 * placeholders for now; the Home content is a "Coming soon" placeholder.
 */
export function IdentityManagerPage() {
  return (
    <AppShell
      breadcrumb={[{ label: 'Home' }]}
      activeGlobalItem="home"
      showSecondarySidebar={false}
    >
      <div className={styles.page}>
        <p className={styles.placeholder}>Coming soon.</p>
      </div>
    </AppShell>
  );
}
