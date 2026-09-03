import { type MouseEvent } from 'react';
import { AppShell } from '../AppShell/AppShell.js';
import { navigate } from '../../lib/router.js';
import { IDENTITY_INSIGHTS_ROUTE } from '../../lib/identityNav.js';
import { Card } from '../../components/Card/Card.js';
import { Link } from '../../components/Link/Link.js';
import { Badge, type BadgeTone } from '../../components/Badge/Badge.js';
import { ContentHeader } from '../../components/ContentHeader/ContentHeader.js';
import { StatCard } from '../../components/StatCard/StatCard.js';
import { DonutChart } from '../../components/DonutChart/DonutChart.js';
import { DataTable, type DataTableColumn } from '../../components/DataTable/DataTable.js';
import { GaugeArc, StackedBar, HBars, AreaTrend, VBars } from './InsightsCharts.js';
import {
  navCoverageByGroup,
  navCoverageTotals,
  roleCoverage,
  MODERNIZATION_TREND,
  type GroupCoverage,
} from './mockIdentityHome.js';
import styles from './IdentityInsightsPage.module.css';

/** Long group labels shortened so dense charts stay legible. */
const SHORT_LABEL: Record<string, string> = {
  'my-access': 'My access',
  'my-team': 'My team',
  operations: 'Operations',
  governance: 'Governance',
  modeling: 'Modeling',
  administration: 'Admin',
  build: 'Build',
  'release-and-deployment': 'Release',
  'platform-setup': 'Platform',
};

const ROLE_SHORT: Record<string, string> = {
  employee: 'Employee',
  manager: 'Manager',
  'help-desk': 'Help desk',
  compliance: 'Compliance',
  administrator: 'Admin',
  builder: 'Builder',
  'admin-builder': 'Admin+Build',
};

const TREND_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const shortLabel = (g: GroupCoverage) => SHORT_LABEL[g.id] ?? g.label;
const pct = (n: number) => `${Math.round(n * 100)}%`;

function modernTone(pctModern: number): BadgeTone {
  if (pctModern >= 0.75) return 'success';
  if (pctModern >= 0.4) return 'warning';
  return 'error';
}

const COVERAGE_COLUMNS: DataTableColumn<GroupCoverage>[] = [
  {
    key: 'area',
    header: 'Area',
    icon: 'Folder',
    minWidth: '200px',
    grow: 2,
    cell: (g) => (
      <Link
        href={g.route}
        onClick={(e: MouseEvent<HTMLAnchorElement>) => {
          e.preventDefault();
          navigate(g.route);
        }}
      >
        {g.label}
      </Link>
    ),
  },
  { key: 'total', header: 'Total', icon: 'ListNumbers', width: '90px', cell: (g) => <span>{g.total}</span> },
  { key: 'web', header: 'Modernized', icon: 'CheckCircle', width: '128px', cell: (g) => <span>{g.web}</span> },
  { key: 'fat', header: 'Fat client', icon: 'Desktop', width: '116px', cell: (g) => <span>{g.fat}</span> },
  { key: 'planned', header: 'Planned', icon: 'Clock', width: '104px', cell: (g) => <span>{g.planned}</span> },
  {
    key: 'pct',
    header: '% modern',
    icon: 'ChartPie',
    width: '120px',
    cell: (g) => <Badge tone={modernTone(g.pctModern)}>{pct(g.pctModern)}</Badge>,
  },
];

/**
 * IdentityInsightsPage — navigation-coverage dashboard (`#/identity/insights`).
 * Visualizes the Identity Manager sidebar taxonomy: how many destinations
 * exist, how modernized they are (web vs fat client vs planned), how they roll
 * up by section, and how much each persona can reach. All charts are d3-driven
 * and animate on mount.
 */
export function IdentityInsightsPage() {
  const totals = navCoverageTotals();
  const byGroup = navCoverageByGroup();
  const roles = roleCoverage();

  const stacked = byGroup.map((g) => ({ label: shortLabel(g), web: g.web, fat: g.fat, planned: g.planned }));
  // "Modernization by area" excludes the Build-section groups (all fat client).
  const modernByArea = byGroup
    .filter((g) => !['build', 'release-and-deployment', 'platform-setup'].includes(g.id))
    .map((g) => ({ label: shortLabel(g), value: g.pctModern }));
  const statusSegments = [
    { label: 'Modernized', value: totals.web },
    { label: 'Fat client', value: totals.fat },
    { label: 'Planned', value: totals.planned },
  ];
  const roleBars = roles.map((r) => ({ label: ROLE_SHORT[r.id] ?? r.label, value: r.items }));

  return (
    <AppShell
      breadcrumb={[{ label: 'Insights' }]}
      activeGlobalItem={IDENTITY_INSIGHTS_ROUTE}
      showSecondarySidebar={false}
    >
      <div className={styles.page}>
        <ContentHeader
          variant="detail"
          icon="PresentationChart"
          iconLabel="Insights"
          title="Insights"
          subtitle="This is a placeholder insights screen, for demonstration purposes only."
          className={styles.pageHeader}
        />

        {/* KPI row */}
        <div className={styles.statGrid}>
          <StatCard label="Destinations" value={String(totals.total)} className={styles.noShadowCard} />
          <StatCard
            label="Modernized"
            value={pct(totals.pctModern)}
            trend={{ direction: 'up', value: `${totals.web} of ${totals.total}`, tone: 'success' }}
            className={styles.noShadowCard}
          />
          <StatCard
            label="In fat client"
            value={String(totals.fat)}
            trend={{ direction: 'warning', value: 'legacy', tone: 'warning' }}
            className={styles.noShadowCard}
          />
        </div>

        {/* Charts — uniform 3-column grid */}
        <div className={styles.chartGrid}>
          <Card title="Overall modernization" helper="Share on the unified web shell" className={styles.noShadowCard}>
            <GaugeArc value={totals.pctModern} />
          </Card>
          <Card title="Modernization trend" helper="Web share over the last 12 months" className={styles.noShadowCard}>
            <AreaTrend data={MODERNIZATION_TREND} labels={TREND_MONTHS} />
          </Card>
          <Card title="Status mix" helper="Web vs fat client vs planned" className={styles.noShadowCard}>
            <DonutChart segments={statusSegments} strokeWidth={10} />
          </Card>
          <Card title="Status by area" helper="Destinations per group, split by status" className={styles.noShadowCard}>
            <StackedBar data={stacked} />
          </Card>
          <Card title="Modernization by area" helper="Percent of each area on web" className={styles.noShadowCard}>
            <HBars data={modernByArea} />
          </Card>
          <Card title="Reach by role" helper="Destinations each persona can open" className={styles.noShadowCard}>
            <VBars data={roleBars} />
          </Card>
        </div>

        {/* Coverage table — open, no card box */}
        <section className={styles.tableSection}>
          <header className={styles.tableHead}>
            <h2 className={styles.tableTitle}>Coverage by area</h2>
            <p className={styles.tableHelper}>Modernization breakdown per group</p>
          </header>
          <DataTable rows={byGroup} columns={COVERAGE_COLUMNS} ariaLabel="Navigation coverage by area" />
        </section>
      </div>
    </AppShell>
  );
}
