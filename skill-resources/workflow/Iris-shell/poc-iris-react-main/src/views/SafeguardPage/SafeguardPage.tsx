import { AppShell } from '../AppShell/AppShell.js';
import styles from './SafeguardPage.module.css';

/**
 * SafeguardPage — landing surface for the Safeguard vertical.
 * Hosted at `#/safeguard`. Sidebar items other than Instance are disabled
 * placeholders for now; the content is a "Coming soon" placeholder.
 */
export function SafeguardPage() {
  return (
    <AppShell
      breadcrumb={[{ label: 'Instance' }]}
      activeGlobalItem="instance"
      showSecondarySidebar={false}
    >
      <div className={styles.page}>
        <p className={styles.placeholder}>Coming soon.</p>
      </div>
    </AppShell>
  );
}
