/** Mock data for the Insights dashboard. */

export type TrendDirection = 'up' | 'down' | 'warning';
export type TrendTone = 'success' | 'warning' | 'danger';

export interface StatCardData {
  id: string;
  label: string;
  value: string;
  trend: { direction: TrendDirection; value: string; tone: TrendTone };
}

export interface BarDatum {
  label: string;
  value: number;
}

export interface DonutDatum {
  label: string;
  value: number;
}

export interface RecentUserActivity {
  id: string;
  role: string;
  department: string;
  lastActive: string;
}

export const STAT_CARDS: StatCardData[] = [
  {
    id: 'users',
    label: 'Managed Users',
    value: '77,236',
    trend: { direction: 'up', value: '2.4% vs last week', tone: 'success' },
  },
  {
    id: 'units',
    label: 'Managed Units',
    value: '141',
    trend: { direction: 'warning', value: '11 broken links', tone: 'warning' },
  },
  {
    id: 'costs',
    label: 'Costs (MTD)',
    value: '$1,035.00',
    trend: { direction: 'up', value: '6.0% vs last month', tone: 'success' },
  },
];

export const USERS_BY_DIRECTORY: BarDatum[] = [
  { label: 'Azure AD', value: 28400 },
  { label: 'Active Dir', value: 21800 },
  { label: 'Google', value: 16200 },
  { label: 'Okta', value: 10836 },
];

export const USERS_BY_REGION: BarDatum[] = [
  { label: 'US East', value: 34000 },
  { label: 'EU West', value: 19500 },
  { label: 'Asia', value: 14200 },
  { label: 'LATAM', value: 9500 },
];

export const DISTRIBUTION: DonutDatum[] = [
  { label: 'Users', value: 77236 },
  { label: 'Groups', value: 12400 },
  { label: 'Computers', value: 8700 },
  { label: 'Resources', value: 4100 },
];

/**
 * Activity overlay for the Insights "Recent Users" table. The `id` of each
 * entry matches a real user in `MOCK_USERS` so the links resolve correctly
 * to `UserDetailPage`. The `role`, `department`, and `lastActive` fields are
 * presentation-only and don't exist on the canonical user record.
 */
export const RECENT_USER_ACTIVITY: RecentUserActivity[] = [
  { id: 'isabella-clark', role: 'Admin', department: 'IT Operations', lastActive: '2 min ago' },
  { id: 'liam-bennett', role: 'User', department: 'Marketing', lastActive: '15 min ago' },
  { id: 'sophia-martinez', role: 'Manager', department: 'Finance', lastActive: '1 hr ago' },
  { id: 'noah-kim', role: 'User', department: 'Engineering', lastActive: '3 hrs ago' },
  { id: 'mason-patel', role: 'Admin', department: 'Security', lastActive: '5 hrs ago' },
];
