import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  MOCK_USERS,
  type User,
  type UserDetails,
} from '../views/UsersPage/mockUsers.js';

/**
 * In-memory users store. Backs the listing and the detail/edit flows.
 *
 * Edits are kept in component state — refreshing the page resets to the
 * mock dataset. That's intentional for a PoC; swap the initial state for
 * `localStorage` or a real API later without touching consumers.
 */

export type UserPatch = Partial<Omit<User, 'details'>> & {
  details?: Partial<UserDetails>;
};

export interface UsersContextValue {
  users: User[];
  getUser: (id: string) => User | null;
  getUserIndex: (id: string) => number;
  updateUser: (id: string, patch: UserPatch) => void;
}

const UsersContext = createContext<UsersContextValue | null>(null);

interface UsersProviderProps {
  children: ReactNode;
}

export function UsersProvider({ children }: UsersProviderProps) {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);

  /**
   * Apply a partial update to one user, merging the `details` sub-object.
   */
  const updateUser = useCallback((id: string, patch: UserPatch) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const merged: User = {
          ...u,
          ...patch,
          details: { ...u.details, ...(patch.details ?? {}) },
        };
        // Keep `fullName` and `name` derived from first/last so the list and
        // breadcrumb stay in sync with the edit form.
        if (patch.details?.firstName || patch.details?.lastName) {
          const first = merged.details.firstName ?? '';
          const last = merged.details.lastName ?? '';
          const full = `${first} ${last}`.trim();
          merged.details.fullName = full;
          merged.name = full;
        }
        return merged;
      }),
    );
  }, []);

  // Inline the lookups inside the memoized value — they only depend on `users`,
  // so wrapping them in their own `useCallback` would buy nothing (the dep
  // changes on every edit anyway).
  const value = useMemo<UsersContextValue>(
    () => ({
      users,
      getUser: (id: string): User | null => users.find((u) => u.id === id) ?? null,
      getUserIndex: (id: string): number => users.findIndex((u) => u.id === id),
      updateUser,
    }),
    [users, updateUser],
  );

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
}

/**
 * Read the users store.
 */
export function useUsers(): UsersContextValue {
  const ctx = useContext(UsersContext);
  if (!ctx) {
    throw new Error('useUsers must be used inside <UsersProvider>');
  }
  return ctx;
}
