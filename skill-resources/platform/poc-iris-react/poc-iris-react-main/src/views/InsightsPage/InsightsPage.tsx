import { useMemo, useState, type MouseEvent } from 'react';
import { AppShell } from '../AppShell/AppShell.js';
import { navigate } from '../../lib/router.js';
import { useUsers } from '../../lib/usersStore.js';
import { Card } from '../../components/Card/Card.js';
import { Tabs } from '../../components/Tabs/Tabs.js';
import { Select } from '../../components/Select/Select.js';
import { IconButton } from '../../components/IconButton/IconButton.js';
import { Tooltip } from '../../components/Tooltip/Tooltip.js';
import { Badge } from '../../components/Badge/Badge.js';
import { Link } from '../../components/Link/Link.js';
import { DataTable, type DataTableColumn } from '../../components/DataTable/DataTable.js';
import { StatCard } from '../../components/StatCard/StatCard.js';
import { BarChart } from '../../components/BarChart/BarChart.js';
import { DonutChart } from '../../components/DonutChart/DonutChart.js';
import {
  STAT_CARDS,
  USERS_BY_DIRECTORY,
  USERS_BY_REGION,
  DISTRIBUTION,
  RECENT_USER_ACTIVITY,
  type RecentUserActivity,
} from './mockInsights.js';
import type { User } from '../UsersPage/mockUsers.js';
import styles from './InsightsPage.module.css';

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'operations', label: 'Operations' },
  { value: 'directories', label: 'Directories' },
];

type RecentRow = User & RecentUserActivity;

const RECENT_COLUMNS: DataTableColumn<RecentRow>[] = [
  {
    key: 'name',
    header: 'Name',
    icon: 'IdentificationCard',
    minWidth: '180px',
    grow: 2,
    cell: (u) => (
      <Link
        href={`#/users/${u.id}`}
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
    key: 'email',
    header: 'Email',
    icon: 'Envelope',
    minWidth: '220px',
    grow: 3,
    cell: (u) => <span>{u.email}</span>,
  },
  {
    key: 'role',
    header: 'Role',
    icon: 'UserCircleCheck',
    width: '120px',
    cell: (u) => <Badge tone={u.role === 'Admin' ? 'info' : 'neutral'}>{u.role}</Badge>,
  },
  {
    key: 'department',
    header: 'Department',
    icon: 'Buildings',
    minWidth: '160px',
    grow: 1,
    cell: (u) => <span>{u.department}</span>,
  },
  {
    key: 'lastActive',
    header: 'Last active',
    icon: 'Clock',
    width: '140px',
    cell: (u) => <span>{u.lastActive}</span>,
  },
];

/**
 * InsightsPage — read-only analytics dashboard. Hosted at #/insights.
 */
export function InsightsPage() {
  const [tab, setTab] = useState('overview');
  const { getUser } = useUsers();

  // Overlay activity metadata (role/department/lastActive) onto real users so
  // each row's link resolves to a valid UserDetailPage.
  const recentRows = useMemo<RecentRow[]>(
    () =>
      RECENT_USER_ACTIVITY.map((meta): RecentRow | null => {
        const u = getUser(meta.id);
        return u ? { ...u, ...meta } : null;
      }).filter((r): r is RecentRow => r !== null),
    [getUser],
  );

  return (
    <AppShell
      breadcrumb={[{ label: 'Insights' }]}
      activeGlobalItem="insights"
      showSecondarySidebar={false}
    >
      <div className={styles.page}>
        {false && (
          <header className={styles.titleRow}>
            <h1 className={styles.pageTitle}>Insights</h1>
          </header>
        )}

        <Tabs items={TABS} value={tab} onChange={setTab} ariaLabel="Insights sections" />

        {tab === 'overview' && (
          <>
            <div className={styles.filters}>
              <div className={styles.filtersLeft}>
                <Select label="Object Type: All" />
                <Select label="Directory: All" />
              </div>
              <div className={styles.filtersRight}>
                <Tooltip label="Refresh">
                  <IconButton
                    icon="ArrowsClockwise"
                    ariaLabel="Refresh"
                    variant="secondary"
                    className={styles.filtersGhostAction}
                  />
                </Tooltip>
                <Tooltip label="Customize">
                  <IconButton
                    icon="Sliders"
                    ariaLabel="Customize"
                    variant="secondary"
                    className={styles.filtersGhostAction}
                  />
                </Tooltip>
                <Tooltip label="Export">
                  <IconButton
                    icon="Export"
                    ariaLabel="Export"
                    variant="secondary"
                    className={styles.filtersGhostAction}
                  />
                </Tooltip>
              </div>
            </div>

            <div className={styles.cardsGridGroup}>
              <div className={styles.statGrid}>
                {STAT_CARDS.map((s) => (
                  <StatCard
                    key={s.id}
                    label={s.label}
                    value={s.value}
                    trend={s.trend}
                    className={styles.noShadowCard}
                  />
                ))}
              </div>

              <div className={styles.chartGrid}>
                <Card
                  title="Users by Directory"
                  helper="Active accounts per source"
                  className={styles.noShadowCard}
                >
                  <BarChart data={USERS_BY_DIRECTORY} color="blue" />
                </Card>
                <Card
                  title="Users by Region"
                  helper="Distribution across geographies"
                  className={styles.noShadowCard}
                >
                  <BarChart data={USERS_BY_REGION} color="purple" />
                </Card>
                <Card
                  title="Object Distribution"
                  helper="Managed objects by type"
                  className={`${styles.noShadowCard} ${styles.distributionCard}`}
                >
                  <DonutChart segments={DISTRIBUTION} />
                </Card>
              </div>
            </div>

            <section className={styles.recent}>
              <header className={styles.recentHead}>
                <h2 className={styles.recentTitle}>Recent Users</h2>
                <p className={styles.recentHelper}>Most recent identity activity</p>
              </header>
              <DataTable rows={recentRows} columns={RECENT_COLUMNS} ariaLabel="Recent users" />
            </section>
          </>
        )}

        {tab !== 'overview' && (
          <Card title={tab === 'operations' ? 'Operations' : 'Directories'}>
            <p className={styles.empty}>Coming soon.</p>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
