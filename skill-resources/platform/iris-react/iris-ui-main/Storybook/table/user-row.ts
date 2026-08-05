// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import type { BadgeType } from '@iris-ui/lib/badge/badge.model';

export interface UserRow {
  name: string;
  initials: string;
  status: string;
  statusType: BadgeType;
  about: string;
  email: string;
  tags: string[];
  location: string;
}

export const userRows: UserRow[] = [
  {
    name: 'Sophia Reyes',
    initials: 'SR',
    status: 'Active',
    statusType: 'success',
    about: 'Senior product designer focused on design systems',
    email: 'sophia.reyes@company.com',
    tags: ['Design', 'UX'],
    location: 'San Francisco, CA',
  },
  {
    name: 'Elena Vasquez',
    initials: 'EV',
    status: 'Pending',
    statusType: 'warning',
    about: 'Frontend engineer specialising in Angular',
    email: 'elena.vasquez@company.com',
    tags: ['Engineering'],
    location: 'New York, NY',
  },
  {
    name: 'Nadia Patel',
    initials: 'NP',
    status: 'Banned',
    statusType: 'error',
    about: 'Product manager for the platform team',
    email: 'nadia.patel@company.com',
    tags: ['Product', 'Strategy'],
    location: 'Austin, TX',
  },
  {
    name: 'Marcus Kim',
    initials: 'MK',
    status: 'Inactive',
    statusType: 'default',
    about: 'Backend engineer, currently on leave',
    email: 'marcus.kim@company.com',
    tags: ['Engineering'],
    location: 'Seattle, WA',
  },
  {
    name: 'James Wilson',
    initials: 'JW',
    status: 'Active',
    statusType: 'success',
    about: 'Data scientist working on ML models',
    email: 'james.wilson@company.com',
    tags: ['Data', 'ML'],
    location: 'Boston, MA',
  },
  {
    name: 'Aria Chen',
    initials: 'AC',
    status: 'Active',
    statusType: 'success',
    about: 'UX researcher with focus on accessibility',
    email: 'aria.chen@company.com',
    tags: ['Research', 'UX'],
    location: 'Portland, OR',
  },
  {
    name: 'Carlos Diaz',
    initials: 'CD',
    status: 'Pending',
    statusType: 'warning',
    about: 'DevOps engineer managing cloud infrastructure',
    email: 'carlos.diaz@company.com',
    tags: ['DevOps'],
    location: 'Miami, FL',
  },
];
