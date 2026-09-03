/**
 * Mock data + derived selectors for the Identity Manager Home and Insights
 * (navigation-coverage) surfaces. Coverage figures are computed from the real
 * nav taxonomy in `identityNav.ts`, so they stay truthful as items change
 * status.
 */

import { IDENTITY_NAV_GROUPS, IDENTITY_ROLES, filterIdentityGroups } from '../../lib/identityNav.js';
import type { NavStatus } from '../../lib/verticals.js';

/** Greeting name shown on Home. Presentation-only mock. */
export const HOME_USER_NAME = 'Abhi';

export interface HomeChip {
  label: string;
  /** Prompt seeded into the AI composer when the chip is clicked. */
  prompt: string;
  icon: string;
}

/** Suggestion chips under the launcher. Clicking one opens the AI panel filled. */
export const HOME_CHIPS: HomeChip[] = [
  { label: 'Set up new employee', prompt: 'Help me set up a new employee.', icon: 'UserPlus' },
  { label: 'Check provisioning status', prompt: 'Check the provisioning status.', icon: 'Eye' },
  { label: 'Review & certify access', prompt: 'Review and certify access.', icon: 'SealCheck' },
];

export interface HomeStatTile {
  value: string;
  label: string;
  route: string;
  /** Dummy sparkline series shown at the bottom of the tile. */
  spark: number[];
}

/** The six number tiles on Home. Routes reuse real section leaves. */
export const HOME_STAT_TILES: HomeStatTile[] = [
  {
    value: '12',
    label: 'Products in shopping cart',
    route: '#/identity/my-access/request-access',
    spark: [0, 1, 0, 2, 1, 0, 3, 8, 5, 2, 0, 1, 0, 0, 4, 1, 0, 2, 0],
  },
  {
    value: '999',
    label: 'Requests to approve',
    route: '#/identity/my-team/approvals',
    spark: [0, 0, 1, 0, 3, 1, 0, 6, 9, 4, 1, 0, 2, 0, 1, 0, 5, 0, 1],
  },
  {
    value: '24',
    label: 'Products in request',
    route: '#/identity/my-access/my-requests',
    spark: [1, 0, 2, 0, 1, 4, 0, 2, 0, 7, 3, 0, 1, 0, 2, 0, 0, 3, 0],
  },
  {
    value: '167',
    label: 'Attestations to approve',
    route: '#/identity/my-access/my-attestations',
    spark: [0, 2, 0, 1, 0, 5, 8, 6, 9, 7, 4, 2, 0, 1, 0, 3, 0, 1, 0],
  },
  {
    value: '64',
    label: 'Rule violations to approve',
    route: '#/identity/governance/rule-violations',
    spark: [0, 1, 0, 0, 2, 0, 4, 1, 0, 3, 0, 1, 0, 6, 2, 0, 1, 0, 0],
  },
  {
    value: '7295',
    label: 'Policy violations to approve',
    route: '#/identity/governance/policy-violations',
    spark: [0, 0, 1, 0, 2, 0, 0, 9, 1, 0, 0, 3, 0, 1, 0, 0, 2, 0, 1],
  },
];

export interface HomeActionCard {
  title: string;
  description: string;
  linkLabel: string;
  route: string;
}

/** The six info/action cards on Home. Targets are the closest real routes. */
export const HOME_ACTION_CARDS: HomeActionCard[] = [
  {
    title: 'Password Questions',
    description: 'Specify your password questions to be able to unlock your user account.',
    linkLabel: 'Specify password questions',
    route: '#/identity/my-access/password-reset',
  },
  {
    title: 'Browser Notifications',
    description: 'Allow this website to send you browser notifications.',
    linkLabel: 'Allow browser notifications',
    route: '#/identity/settings',
  },
  {
    title: 'New Request',
    description: 'Request products for yourself or for others.',
    linkLabel: 'Request products',
    route: '#/identity/my-access/request-access',
  },
  {
    title: 'Application KPI Overview',
    description: 'Get an overview of the KPIs for your applications.',
    linkLabel: 'View KPI overview',
    route: '#/identity/insights',
  },
  {
    title: 'Team Role',
    description: 'Manage the entitlements required for your team using a team role.',
    linkLabel: 'Create team role',
    route: '#/identity/modeling/business-roles',
  },
  {
    title: 'My Direct Reports',
    description: 'View and manage identities you are directly responsible for.',
    linkLabel: 'Create identity',
    route: '#/identity/my-team/direct-reports',
  },
];

/* ── Navigation-coverage selectors (derived from the real taxonomy) ────── */

export interface GroupCoverage {
  id: string;
  label: string;
  /** First section route in the group — used to make the row navigable. */
  route: string;
  total: number;
  web: number;
  fat: number;
  planned: number;
  /** Share of items that are modernized (web), 0–1. */
  pctModern: number;
}

export interface CoverageTotals {
  total: number;
  web: number;
  fat: number;
  planned: number;
  pctModern: number;
}

function countStatus(items: { status?: NavStatus }[], status: NavStatus): number {
  return items.filter((i) => (i.status ?? 'web') === status).length;
}

/** Per-group coverage breakdown, in taxonomy order. */
export function navCoverageByGroup(): GroupCoverage[] {
  return IDENTITY_NAV_GROUPS.map((g) => {
    const total = g.items.length;
    const web = countStatus(g.items, 'web');
    const fat = countStatus(g.items, 'fat');
    const planned = countStatus(g.items, 'planned');
    return {
      id: g.id,
      label: g.label,
      route: g.items[0]?.route ?? '#/identity',
      total,
      web,
      fat,
      planned,
      pctModern: total ? web / total : 0,
    };
  });
}

/** Roll-up totals across every group. */
export function navCoverageTotals(): CoverageTotals {
  const byGroup = navCoverageByGroup();
  const total = byGroup.reduce((s, g) => s + g.total, 0);
  const web = byGroup.reduce((s, g) => s + g.web, 0);
  const fat = byGroup.reduce((s, g) => s + g.fat, 0);
  const planned = byGroup.reduce((s, g) => s + g.planned, 0);
  return { total, web, fat, planned, pctModern: total ? web / total : 0 };
}

export interface SectionCoverage {
  section: string;
  total: number;
  web: number;
  fat: number;
  planned: number;
  pctModern: number;
}

/** Coverage rolled up by sidebar section (Personal / Governance / …). */
export function navCoverageBySection(): SectionCoverage[] {
  const order: string[] = [];
  const map = new Map<string, SectionCoverage>();
  for (const g of IDENTITY_NAV_GROUPS) {
    const section = g.section ?? 'Other';
    let e = map.get(section);
    if (!e) {
      e = { section, total: 0, web: 0, fat: 0, planned: 0, pctModern: 0 };
      map.set(section, e);
      order.push(section);
    }
    for (const item of g.items) {
      e.total += 1;
      e[item.status ?? 'web'] += 1;
    }
  }
  return order.map((s) => {
    const e = map.get(s)!;
    return { ...e, pctModern: e.total ? e.web / e.total : 0 };
  });
}

export interface RoleCoverage {
  id: string;
  label: string;
  groups: number;
  items: number;
}

/** How many groups + destinations each persona (role) can reach. Excludes the
 *  "All (review mode)" pseudo-role, which sees everything. */
export function roleCoverage(): RoleCoverage[] {
  return IDENTITY_ROLES.filter((r) => r.id !== 'all').map((r) => {
    const groups = filterIdentityGroups(r.id);
    return {
      id: r.id,
      label: r.label,
      groups: groups.length,
      items: groups.reduce((s, g) => s + g.items.length, 0),
    };
  });
}

/** Dummy 12-month modernization trend (share of web destinations), trending up
 *  toward the current coverage. Presentation-only. */
export const MODERNIZATION_TREND: number[] = [
  0.41, 0.43, 0.46, 0.49, 0.52, 0.54, 0.57, 0.6, 0.63, 0.66, 0.69, 0.72,
];
