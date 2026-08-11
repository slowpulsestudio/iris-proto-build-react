import type { HeaderUser } from '../components/AppHeader/AppHeader.js';

/**
 * Mock signed-in user. Single source of truth for every AppShell instance;
 * also the default value of `AppShellProps.user`.
 */
export const CURRENT_USER: HeaderUser = {
  name: 'Sara Ito',
  src: '/avatar02.png',
  email: 'sara.ito@example.com',
};
