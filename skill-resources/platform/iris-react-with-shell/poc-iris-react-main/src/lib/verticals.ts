import { useRoute, type Route, type RouteName } from './router.js';
import type { ProductIconName } from '../components/ProductIcon/ProductIcon.js';
import type { SidebarNavItem } from '../components/Sidebar/Sidebar.js';

/**
 * Vertical — a top-level product surface within the application (e.g. Active
 * Roles, On-Demand Services). Verticals share the same global chrome
 * (header + global sidebar + Ask AI panel) but supply their own copy and
 * navigation entries. The current vertical is derived from the active route.
 */
export type VerticalId = 'active-roles' | 'services' | 'identity-manager' | 'safeguard';

export interface VerticalNavEntry {
  value: string;
  label: string;
  icon: string;
  /** Shown but not interactive (no route wired yet). */
  disabled?: boolean;
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
  /**
   * Product-specific Figma sub-library URL for this vertical.
   * This is additive to `IRIS_GLOBAL_LIBRARIES`, not a replacement.
   */
  subLibraryUrl?: string;
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
  /** Optional secondary-sidebar configuration. Pages can still hide the
   *  rail per-view via `<AppShell showSecondarySidebar={false}>`. */
  secondarySidebar?: VerticalSecondarySidebar;
}

export interface IrisGlobalLibraries {
  components: string;
  icons: string;
  variables: string;
  charts: string;
  /** Optional master URL for motion patterns, when available. */
  motionPatterns?: string;
}

/**
 * Global Iris design libraries used across all verticals.
 * Each vertical may also provide `subLibraryUrl` for product-specific additions.
 */
export const IRIS_GLOBAL_LIBRARIES: IrisGlobalLibraries = {
  components: 'https://www.figma.com/design/kgmR6KueZaAaS1t9m3WLiQ/Iris-UI--UI-Kit?m=auto',
  icons: 'https://www.figma.com/design/NOXsUiIDjq0lpRXrAXySLn/Iris-UI--Icons?m=auto&t=7AMUiiJR0qad7aso-1',
  variables: 'https://www.figma.com/design/QwUAD0F9iGg2ePmEKPk22J/Iris-UI--Variables?m=auto',
  charts: 'https://www.figma.com/design/udiUmrkIKf7EqwsAfZft0x/Iris-UI--Charts?m=auto&t=7AMUiiJR0qad7aso-6',
  motionPatterns: 'PENDING: Create Figma motion pattern page',
};

const COMMON_OTHER_NAV: VerticalNavEntry[] = [
  { value: 'settings', label: 'Settings', icon: 'GearFine', disabled: true },
  { value: 'help', label: 'Help with', icon: 'Question', disabled: true },
];

export const ACTIVE_ROLES_VERTICAL: Vertical = {
  id: 'active-roles',
  label: 'Active Roles',
  subLibraryUrl: 'https://www.figma.com/design/IlG4nne9VhqpONzqc0tfKg/ARS---Master?m=auto',
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
  subLibraryUrl: 'https://www.figma.com/design/tisOoVX7lkvXqwHGCWdx78/On-Demand---Master?m=auto&t=7AMUiiJR0qad7aso-6',
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
  subLibraryUrl: 'https://www.figma.com/design/DHXdGN5yW90DCi5a2ga9Yh/IM---Master?m=auto&t=7AMUiiJR0qad7aso-6',
  productIcon: 'identity-manager',
  defaultRoute: '#/identity',
  aiTitle: 'Identity Manager AI',
  mainNav: [
    { value: 'home', label: 'Home', icon: 'House' },
    { value: 'requests', label: 'Requests', icon: 'Bell', disabled: true },
    { value: 'recertification', label: 'ReCertification', icon: 'SealCheck', disabled: true },
    { value: 'compliance', label: 'Compliance', icon: 'ShieldCheck', disabled: true },
    { value: 'responsibilities', label: 'Responsibilities', icon: 'Handshake', disabled: true },
  ],
  otherNav: [
    { value: 'data-administration', label: 'Data administration', icon: 'Stack', disabled: true },
    { value: 'help', label: 'Help with', icon: 'Question', disabled: true },
  ],
};

export const SAFEGUARD_VERTICAL: Vertical = {
  id: 'safeguard',
  label: 'Safeguard',
  subLibraryUrl: '',
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
const IDENTITY_ROUTES: ReadonlySet<RouteName> = new Set<RouteName>(['identityHome']);

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
