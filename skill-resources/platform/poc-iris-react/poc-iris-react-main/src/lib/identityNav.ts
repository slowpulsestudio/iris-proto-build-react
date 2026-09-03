import type { VerticalNavEntry, VerticalNavGroup, NavStatus } from './verticals.js';

/**
 * identityNav — the single source of truth for the Identity Manager shell:
 * the grouped nav taxonomy, the role-preview options, per-role group
 * visibility, and status metadata. Consumed by the vertical model
 * ([verticals.ts]), the global sidebar, the Home landing page, and the
 * generic section (leaf) page.
 *
 * URLs are `#/identity/<group.id>/<item.value>`. Both segments are unique,
 * lowercase, hyphenated slugs; item values are unique within a group and the
 * group segment namespaces them, so no cross-group collisions are possible.
 */

export type RoleId =
  | 'all'
  | 'employee'
  | 'manager'
  | 'help-desk'
  | 'compliance'
  | 'administrator'
  | 'builder'
  | 'admin-builder';

export interface IdentityRole {
  id: RoleId;
  label: string;
  /** Library icon glyph shown beside the role in the switcher menu. */
  icon: string;
}

/** Header "Preview as" options, in display order. `all` = review mode. */
export const IDENTITY_ROLES: IdentityRole[] = [
  { id: 'all', label: 'All (review mode)', icon: 'Eye' },
  { id: 'employee', label: 'Employee', icon: 'User' },
  { id: 'manager', label: 'Manager', icon: 'Briefcase' },
  { id: 'help-desk', label: 'Help desk', icon: 'Headset' },
  { id: 'compliance', label: 'Compliance', icon: 'ShieldCheck' },
  { id: 'administrator', label: 'Administrator', icon: 'UserGear' },
  { id: 'builder', label: 'Builder / integrator', icon: 'Wrench' },
  { id: 'admin-builder', label: 'Administrator + Builder', icon: 'Crown' },
];

const ROLE_IDS = new Set<RoleId>(IDENTITY_ROLES.map((r) => r.id));

/** Narrow an untrusted value (e.g. from localStorage) to a known `RoleId`. */
export function isRoleId(value: unknown): value is RoleId {
  return typeof value === 'string' && ROLE_IDS.has(value as RoleId);
}

/** Standalone top-of-rail item, always visible regardless of role. */
export const IDENTITY_HOME_ITEM: VerticalNavEntry = {
  value: 'home',
  label: 'Account home',
  icon: 'House',
};

/** Route for the Identity Manager Insights surface. */
export const IDENTITY_INSIGHTS_ROUTE = '#/identity/insights';

/** Standalone Insights item, shown directly below Home (always visible). */
export const IDENTITY_INSIGHTS_ITEM: VerticalNavEntry = {
  value: 'idm-insights',
  label: 'Insights',
  icon: 'PresentationChart',
  route: IDENTITY_INSIGHTS_ROUTE,
};

/** Routes for the "Other" section pages. */
export const IDENTITY_SETTINGS_ROUTE = '#/identity/settings';
export const IDENTITY_HELP_ROUTE = '#/identity/help';

/** "Other" section items rendered at the end of the rail. */
export const IDENTITY_OTHER_NAV: VerticalNavEntry[] = [
  { value: 'settings', label: 'Settings', icon: 'GearFine', route: IDENTITY_SETTINGS_ROUTE },
  { value: 'help', label: 'Help with', icon: 'Question', route: IDENTITY_HELP_ROUTE },
];

/** Build the route hash for a section item. */
export function identitySectionHash(groupId: string, itemValue: string): string {
  return `#/identity/${groupId}/${itemValue}`;
}

/**
 * Internal authoring shape — the route is derived from group + value so it
 * never has to be hand-typed at call sites.
 */
interface RawItem {
  value: string;
  label: string;
  icon: string;
  status: NavStatus;
}

interface RawGroup {
  id: string;
  label: string;
  icon: string;
  description: string;
  items: RawItem[];
}

const RAW_GROUPS: RawGroup[] = [
  {
    id: 'my-access',
    label: 'My access',
    icon: 'Fingerprint',
    description: 'Self-service, from the Web Portal.',
    items: [
      { value: 'request-access', label: 'Request access', icon: 'HandArrowDown', status: 'web' },
      { value: 'my-requests', label: 'My requests', icon: 'ClipboardText', status: 'web' },
      { value: 'my-profile', label: 'My profile', icon: 'IdentificationCard', status: 'web' },
      { value: 'my-attestations', label: 'My attestations', icon: 'SealCheck', status: 'web' },
      { value: 'password-reset', label: 'Password reset', icon: 'Key', status: 'web' },
    ],
  },
  {
    id: 'my-team',
    label: 'My team',
    icon: 'UsersThree',
    description: 'Manager tasks, from the Web Portal.',
    items: [
      { value: 'approvals', label: 'Approvals', icon: 'ListChecks', status: 'web' },
      { value: 'direct-reports', label: 'Direct reports', icon: 'UsersThree', status: 'web' },
      { value: 'delegations', label: 'Delegations', icon: 'Handshake', status: 'web' },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    icon: 'Lightning',
    description: 'Help-desk tasks, from the Operations Support Web Portal.',
    items: [
      { value: 'search-and-assist', label: 'Search and assist', icon: 'MagnifyingGlass', status: 'web' },
      { value: 'password-and-unlock', label: 'Password and unlock', icon: 'LockKey', status: 'web' },
      { value: 'act-on-behalf', label: 'Act on behalf', icon: 'UserSwitch', status: 'web' },
      { value: 'process-monitoring', label: 'Process monitoring', icon: 'Broadcast', status: 'web' },
      { value: 'synchronization-status', label: 'Synchronization status', icon: 'ArrowsClockwise', status: 'web' },
      { value: 'job-queue', label: 'Job queue', icon: 'Queue', status: 'web' },
    ],
  },
  {
    id: 'governance',
    label: 'Governance',
    icon: 'ShieldCheck',
    description:
      'Running controls and most authoring is on web. Rule and policy definition is the last fat-client piece.',
    items: [
      { value: 'attestation-runs', label: 'Attestation runs', icon: 'SealCheck', status: 'web' },
      { value: 'attestation-policies', label: 'Attestation policies', icon: 'Scroll', status: 'web' },
      { value: 'rule-violations', label: 'Rule violations and exceptions', icon: 'Warning', status: 'web' },
      { value: 'policy-violations', label: 'Policy violations and exceptions', icon: 'WarningDiamond', status: 'web' },
      { value: 'risk-assessment', label: 'Risk assessment', icon: 'Gauge', status: 'web' },
      { value: 'compliance-rule-authoring', label: 'Compliance rule authoring', icon: 'Scales', status: 'fat' },
      { value: 'company-policy-authoring', label: 'Company policy authoring', icon: 'FileText', status: 'fat' },
    ],
  },
  {
    id: 'modeling',
    label: 'Modeling',
    icon: 'TreeStructure',
    description: 'Role and org model. Confirmed on web via Data Explorer and My responsibilities.',
    items: [
      { value: 'role-model', label: 'Role model', icon: 'TreeStructure', status: 'web' },
      { value: 'organizations', label: 'Organizations', icon: 'Buildings', status: 'web' },
      { value: 'business-roles', label: 'Business roles', icon: 'Briefcase', status: 'web' },
      { value: 'reports', label: 'Reports', icon: 'ChartBar', status: 'web' },
      { value: 'object-history', label: 'Object history', icon: 'ClockCounterClockwise', status: 'web' },
    ],
  },
  {
    id: 'administration',
    label: 'Administration',
    icon: 'GearFine',
    description: 'Target systems and configuration. The config slice is confirmed on web.',
    items: [
      { value: 'target-system-accounts', label: 'Target system accounts', icon: 'UserList', status: 'web' },
      { value: 'target-system-configuration', label: 'Target system configuration', icon: 'GearFine', status: 'fat' },
      { value: 'connectors-and-sync-projects', label: 'Connectors and sync projects', icon: 'Plugs', status: 'web' },
      { value: 'application-roles', label: 'Application roles', icon: 'IdentificationBadge', status: 'web' },
      { value: 'configuration-parameters', label: 'Configuration parameters', icon: 'Sliders', status: 'web' },
      { value: 'schedules', label: 'Schedules', icon: 'CalendarBlank', status: 'web' },
      { value: 'system-status', label: 'System status', icon: 'Gauge', status: 'web' },
    ],
  },
  {
    id: 'build',
    label: 'Build',
    icon: 'Wrench',
    description: 'Authoring and configuration. Almost all fat client today.',
    items: [
      { value: 'designer', label: 'Designer', icon: 'Compass', status: 'fat' },
      { value: 'schema-extension', label: 'Schema Extension', icon: 'Database', status: 'fat' },
      { value: 'sync-editor', label: 'Sync Editor', icon: 'Shuffle', status: 'fat' },
      { value: 'data-import', label: 'Data Import', icon: 'CloudArrowUp', status: 'fat' },
      { value: 'report-editor', label: 'Report Editor', icon: 'FileText', status: 'fat' },
      { value: 'object-browser', label: 'Object Browser', icon: 'FileMagnifyingGlass', status: 'fat' },
      { value: 'system-debugger', label: 'System Debugger', icon: 'Bug', status: 'fat' },
      { value: 'web-designer', label: 'Web Designer', icon: 'Wrench', status: 'fat' },
      { value: 'analyzer', label: 'Analyzer', icon: 'ChartLine', status: 'fat' },
    ],
  },
  {
    id: 'release-and-deployment',
    label: 'Release and deployment',
    icon: 'Package',
    description:
      'Moving changes between environments, plus upgrade and consistency. Fat client today.',
    items: [
      { value: 'database-transporter', label: 'Database Transporter', icon: 'Package', status: 'fat' },
      { value: 'database-compiler', label: 'Database Compiler', icon: 'Cpu', status: 'fat' },
      { value: 'software-loader', label: 'Software Loader', icon: 'HardDrives', status: 'fat' },
      { value: 'upgrade-suite', label: 'Upgrade Suite', icon: 'ArrowFatUp', status: 'planned' },
    ],
  },
  {
    id: 'platform-setup',
    label: 'Platform setup',
    icon: 'Stack',
    description: 'Install and infrastructure. Not a daily task, but it has a home.',
    items: [
      { value: 'configuration-wizard', label: 'Configuration Wizard', icon: 'MagicWand', status: 'fat' },
      { value: 'crypto-configuration', label: 'Crypto Configuration', icon: 'Lock', status: 'fat' },
    ],
  },
];

/** Per-role visible group ids. `all` means every group (review mode). */
const ROLE_GROUPS: Record<Exclude<RoleId, 'all'>, string[]> = {
  employee: ['my-access'],
  manager: ['my-access', 'my-team'],
  'help-desk': ['my-access', 'operations'],
  compliance: ['my-access', 'governance'],
  administrator: ['my-access', 'operations', 'modeling', 'administration'],
  builder: ['build', 'release-and-deployment', 'platform-setup'],
  'admin-builder': [
    'my-access',
    'operations',
    'modeling',
    'administration',
    'build',
    'release-and-deployment',
    'platform-setup',
  ],
};

/** Sidebar category caption per group id (a header renders when it changes). */
const GROUP_SECTIONS: Record<string, string> = {
  'my-access': 'Personal',
  'my-team': 'Personal',
  operations: 'Governance',
  governance: 'Governance',
  modeling: 'Governance',
  administration: 'Administer',
  build: 'Build',
  'release-and-deployment': 'Build',
  'platform-setup': 'Build',
};

/** The full grouped taxonomy as generic sidebar groups (route pre-computed). */
export const IDENTITY_NAV_GROUPS: VerticalNavGroup[] = RAW_GROUPS.map((group) => ({
  id: group.id,
  label: group.label,
  icon: group.icon,
  description: group.description,
  section: GROUP_SECTIONS[group.id],
  items: group.items.map(
    (item): VerticalNavEntry => ({
      value: item.value,
      label: item.label,
      icon: item.icon,
      status: item.status,
      route: identitySectionHash(group.id, item.value),
    }),
  ),
}));

/** Whether a group is visible for the given role. */
function isIdentityGroupVisible(groupId: string, role: RoleId): boolean {
  if (role === 'all') return true;
  return ROLE_GROUPS[role].includes(groupId);
}

/** Groups visible for a role, preserving taxonomy order. */
export function filterIdentityGroups(role: RoleId): VerticalNavGroup[] {
  if (role === 'all') return IDENTITY_NAV_GROUPS;
  return IDENTITY_NAV_GROUPS.filter((g) => isIdentityGroupVisible(g.id, role));
}

export interface IdentitySection {
  group: VerticalNavGroup;
  item: VerticalNavEntry;
}

/** Resolve a `#/identity/<group>/<item>` pair to its group + item, or null. */
export function findIdentitySection(groupId: string, itemValue: string): IdentitySection | null {
  const group = IDENTITY_NAV_GROUPS.find((g) => g.id === groupId);
  if (!group) return null;
  const item = group.items.find((i) => i.value === itemValue);
  if (!item) return null;
  return { group, item };
}
