import { useRoute, type Route, type RouteName } from './router.js';
import type { ProductIconName } from '../components/ProductIcon/ProductIcon.js';
import type { SidebarNavItem } from '../components/Sidebar/Sidebar.js';
import {
  IDENTITY_HOME_ITEM,
  IDENTITY_INSIGHTS_ITEM,
  IDENTITY_NAV_GROUPS,
  IDENTITY_OTHER_NAV,
} from './identityNav.js';

/**
 * Vertical — a top-level product surface within the application (e.g. Active
 * Roles, On-Demand Services). Verticals share the same global chrome
 * (header + global sidebar + Ask AI panel) but supply their own copy and
 * navigation entries. The current vertical is derived from the active route.
 */
export type VerticalId = 'active-roles' | 'services' | 'identity-manager' | 'safeguard';

/** Delivery status of a nav destination, surfaced as a status dot/badge. */
export type NavStatus = 'web' | 'fat' | 'planned';

export interface VerticalNavEntry {
  value: string;
  label: string;
  icon: string;
  /** Shown but not interactive (no route wired yet). */
  disabled?: boolean;
  /** Delivery status badge (grouped nav only). */
  status?: NavStatus;
  /** Explicit route hash to navigate to. When absent, `value` is used. */
  route?: string;
}

/** A collapsible section of nav entries (grouped-sidebar verticals). */
export interface VerticalNavGroup {
  id: string;
  label: string;
  /** Optional group glyph (used on Home cards; the sidebar header is text). */
  icon?: string;
  /** Optional supporting copy (used on Home cards). */
  description?: string;
  /** Optional category caption; a header renders when it changes between groups. */
  section?: string;
  items: VerticalNavEntry[];
}

export interface VerticalSecondarySidebar {
  /** Label shown in the directory selector at the top of the rail. */
  directoryLabel: string;
  /** Nav items rendered below the directory selector. */
  navItems: SidebarNavItem[];
}

export interface Vertical {
  id: VerticalId;
  /** Display name in the product chooser and global sidebar header. */
  label: string;
  /** Glyph used by the product chooser entry for this vertical. */
  productIcon: ProductIconName;
  /** Route hash to navigate to when this vertical is selected. */
  defaultRoute: string;
  /** Title shown in the Ask AI panel chrome. */
  aiTitle: string;
  /** MAIN-section global-nav items. */
  mainNav: VerticalNavEntry[];
  /** OTHER-section global-nav items. */
  otherNav: VerticalNavEntry[];
  /** Optional collapsible nav groups. When present, the sidebar renders these
   *  (below `mainNav`) instead of the flat `otherNav` section. */
  navGroups?: VerticalNavGroup[];
  /** Optional secondary-sidebar configuration. Pages can still hide the
   *  rail per-view via `<AppShell showSecondarySidebar={false}>`. */
  secondarySidebar?: VerticalSecondarySidebar;
}

const COMMON_OTHER_NAV: VerticalNavEntry[] = [
  { value: 'settings', label: 'Settings', icon: 'GearFine', disabled: true },
  { value: 'help', label: 'Help with', icon: 'Question', disabled: true },
];

export const ACTIVE_ROLES_VERTICAL: Vertical = {
  id: 'active-roles',
  label: 'Active Roles',
  productIcon: 'active-roles',
  defaultRoute: '#/insights',
  aiTitle: 'Active Roles AI',
  mainNav: [
    { value: 'directory', label: 'Directory management', icon: 'TreeView' },
    { value: 'insights', label: 'Insights', icon: 'PresentationChart' },
    { value: 'approval', label: 'Approval', icon: 'SealCheck', disabled: true },
    { value: 'customization', label: 'Customization', icon: 'Wrench', disabled: true },
  ],
  otherNav: COMMON_OTHER_NAV,
  secondarySidebar: {
    directoryLabel: 'All directories',
    navItems: [
      { value: 'users', label: 'Users', icon: 'Users' },
      { value: 'groups', label: 'Groups', icon: 'UsersThree' },
      { value: 'devices', label: 'Devices', icon: 'Devices' },
      { value: 'agents', label: 'Agents', icon: 'Robot' },
      { value: 'applications', label: 'Applications', icon: 'Browsers' },
      { value: 'access-templates', label: 'Access templates', icon: 'UserCircleCheck' },
      { value: 'management-units', label: 'Management units', icon: 'FolderSimpleStar' },
    ],
  },
};

export const SERVICES_VERTICAL: Vertical = {
  id: 'services',
  label: 'On Demand Services',
  productIcon: 'services',
  defaultRoute: '#/services',
  aiTitle: 'On Demand Services AI',
  mainNav: [
    { value: 'services', label: 'Services', icon: 'Stack' },
    { value: 'access', label: 'Access', icon: 'Key', disabled: true },
    { value: 'configuration', label: 'Configuration', icon: 'GearFine', disabled: true },
  ],
  otherNav: COMMON_OTHER_NAV,
};

export const IDENTITY_MANAGER_VERTICAL: Vertical = {
  id: 'identity-manager',
  label: 'Identity Manager',
  productIcon: 'identity-manager',
  defaultRoute: '#/identity',
  aiTitle: 'Identity Manager AI',
  mainNav: [IDENTITY_HOME_ITEM, IDENTITY_INSIGHTS_ITEM],
  otherNav: IDENTITY_OTHER_NAV,
  navGroups: IDENTITY_NAV_GROUPS,
};

export const SAFEGUARD_VERTICAL: Vertical = {
  id: 'safeguard',
  label: 'Safeguard',
  productIcon: 'safeguard',
  defaultRoute: '#/safeguard',
  aiTitle: 'Safeguard AI',
  mainNav: [
    { value: 'instance', label: 'Instance', icon: 'Cube' },
    { value: 'collaborators', label: 'Collaborators', icon: 'UsersThree', disabled: true },
    { value: 'activity', label: 'Activity', icon: 'Pulse', disabled: true },
  ],
  otherNav: COMMON_OTHER_NAV,
};

/** Route names that belong to the Services vertical. */
const SERVICES_ROUTES: ReadonlySet<RouteName> = new Set<RouteName>(['services']);

/** Route names that belong to the Identity Manager vertical. */
const IDENTITY_ROUTES: ReadonlySet<RouteName> = new Set<RouteName>([
  'identityHome',
  'identityInsights',
  'identitySettings',
  'identityHelp',
  'identitySection',
]);

/** Route names that belong to the Safeguard vertical. */
const SAFEGUARD_ROUTES: ReadonlySet<RouteName> = new Set<RouteName>(['safeguardHome']);

export function verticalForRoute(route: Route): Vertical {
  if (IDENTITY_ROUTES.has(route.name)) return IDENTITY_MANAGER_VERTICAL;
  if (SAFEGUARD_ROUTES.has(route.name)) return SAFEGUARD_VERTICAL;
  return SERVICES_ROUTES.has(route.name) ? SERVICES_VERTICAL : ACTIVE_ROLES_VERTICAL;
}

/** Hook variant — re-evaluates whenever the active route changes. */
export function useVertical(): Vertical {
  return verticalForRoute(useRoute());
}
