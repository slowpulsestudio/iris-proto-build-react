import type { TabItem } from '../../components/Tabs/Tabs.js';
import type { DirectoryObjectType } from '../../lib/directoryData.js';

/**
 * Per-object-type tab sets for the Tree detail page. `General` is the primary
 * tab (renders real content); the rest are "Coming soon" stubs, mirroring how
 * `UserDetailPage` stubs its non-overview tabs.
 */

const USER_TABS: TabItem[] = [
  { value: 'overview', label: 'Overview', icon: 'Briefcase' },
  { value: 'general', label: 'General', icon: 'IdentificationCard' },
  { value: 'user-details', label: 'User Details', icon: 'IdentificationBadge' },
  { value: 'account', label: 'Account', icon: 'UserCircle' },
  { value: 'connections', label: 'Connections', icon: 'Plugs' },
  { value: 'memberships', label: 'Memberships', icon: 'UsersThree' },
  { value: 'managed-units', label: 'Managed Units', icon: 'FolderStar' },
  { value: 'roles', label: 'Roles', icon: 'ShieldCheck' },
  { value: 'authorization', label: 'Authorization', icon: 'Key' },
  { value: 'object', label: 'Object', icon: 'Cube' },
  { value: 'history', label: 'History', icon: 'ClockCounterClockwise' },
];

const COMPUTER_TABS: TabItem[] = [
  { value: 'overview', label: 'Overview', icon: 'Briefcase' },
  { value: 'general', label: 'General', icon: 'Devices' },
  { value: 'operating-system', label: 'Operating System', icon: 'Cube' },
  { value: 'connections', label: 'Connections', icon: 'Plugs' },
  { value: 'object', label: 'Object', icon: 'Cube' },
  { value: 'history', label: 'History', icon: 'ClockCounterClockwise' },
];

const GROUP_TABS: TabItem[] = [
  { value: 'overview', label: 'Overview', icon: 'Briefcase' },
  { value: 'general', label: 'General', icon: 'UsersThree' },
  { value: 'members', label: 'Members', icon: 'Users' },
  { value: 'managed-units', label: 'Managed Units', icon: 'FolderStar' },
  { value: 'object', label: 'Object', icon: 'Cube' },
  { value: 'history', label: 'History', icon: 'ClockCounterClockwise' },
];

const CONTAINER_TABS: TabItem[] = [
  { value: 'overview', label: 'Overview', icon: 'Briefcase' },
  { value: 'general', label: 'General', icon: 'IdentificationCard' },
  { value: 'object', label: 'Object', icon: 'Cube' },
  { value: 'history', label: 'History', icon: 'ClockCounterClockwise' },
];

const TABS_BY_TYPE: Record<DirectoryObjectType, TabItem[]> = {
  user: USER_TABS,
  contact: USER_TABS,
  computer: COMPUTER_TABS,
  group: GROUP_TABS,
  gmsa: GROUP_TABS,
  ou: CONTAINER_TABS,
  container: CONTAINER_TABS,
};

/** The primary (content-bearing) tab value for every type. */
export const PRIMARY_TAB = 'general';

export function tabsForType(type: DirectoryObjectType): TabItem[] {
  return TABS_BY_TYPE[type] ?? CONTAINER_TABS;
}
