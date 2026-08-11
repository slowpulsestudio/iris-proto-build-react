/** Mock data for the Users listing + detail PoC. Mirrors the Figma reference. */

export interface UserDetails {
  firstName: string;
  lastName: string;
  fullName: string;
  displayName: string;
  initials: string;
  longDescription: string;
  login: string;
  type: string;
  managementUnit: string;
}

export interface User {
  id: string;
  name: string;
  status: string;
  description: string;
  email: string;
  objectId: string;
  details: UserDetails;
}

const LOREM = `Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.`;

/**
 * Build the detail payload for a user. Keeps the listing rows compact while
 * still giving the detail page rich content to render.
 */
function makeDetails(name: string, login: string): UserDetails {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const parts = name.split(/\s+/);
  const firstName = parts[0] ?? '';
  const lastName = parts.slice(1).join(' ');
  const displayName = (firstName[0] ?? '') + lastName;
  return {
    firstName,
    lastName,
    fullName: name,
    displayName,
    initials,
    longDescription: LOREM,
    login,
    type: 'User',
    managementUnit: 'Management',
  };
}

/**
 * Generate a batch of additional filler users so the listing has enough rows
 * to exercise pagination. Names/emails/statuses are varied but deterministic.
 */
function makeMockUsers(): User[] {
  const firstNames = [
    'Aiden', 'Harper', 'Elijah', 'Amelia', 'Benjamin', 'Charlotte', 'James',
    'Evelyn', 'Henry', 'Abigail', 'Alexander', 'Emily', 'Sebastian', 'Elizabeth',
    'Jack', 'Sofia', 'Owen', 'Avery', 'Daniel', 'Ella', 'Matthew', 'Scarlett',
    'Joseph', 'Grace', 'Samuel', 'Chloe', 'David', 'Victoria', 'Carter', 'Riley',
    'Wyatt', 'Aria', 'Julian', 'Lily', 'Leo',
    'Gabriel', 'Zoe', 'Anthony', 'Nora', 'Dylan', 'Hazel', 'Lincoln', 'Layla',
    'Isaac', 'Aurora', 'Hudson', 'Savannah', 'Ezra', 'Brooklyn', 'Nathan', 'Bella',
    'Adrian', 'Claire', 'Christian', 'Skylar', 'Maverick', 'Lucy', 'Colton', 'Paisley',
    'Elias', 'Everly', 'Aaron', 'Anna', 'Eli', 'Caroline', 'Landon', 'Nova',
    'Jonathan', 'Genesis', 'Nolan', 'Emilia', 'Cameron', 'Kennedy', 'Connor', 'Maya',
    'Jeremiah', 'Willow', 'Easton', 'Kinsley', 'Miles', 'Naomi', 'Robert', 'Aaliyah',
    'Greyson', 'Elena',
  ];
  const lastNames = [
    'Hughes', 'Coleman', 'Jenkins', 'Perry', 'Powell', 'Long', 'Patterson',
    'Hughes', 'Flores', 'Washington', 'Butler', 'Simmons', 'Foster', 'Gonzales',
    'Bryant', 'Alexander', 'Russell', 'Griffin', 'Diaz', 'Hayes', 'Myers',
    'Ford', 'Hamilton', 'Graham', 'Sullivan', 'Wallace', 'Woods', 'Cole',
    'West', 'Jordan', 'Owens', 'Reynolds', 'Fisher', 'Ellis', 'Harrison',
  ];
  const statuses = ['Active', 'Active', 'Active', 'Inactive', 'Unknown', 'Pending', 'Disabled'];
  const descriptions = [
    'Manages identity lifecycle and access reviews.',
    'Maintains platform security tooling and automation.',
    'Handles directory synchronization and provisioning.',
    'Supports incident response and threat monitoring.',
    'Owns access certification and audit workflows.',
    'Administers role-based access control policies.',
    'Coordinates onboarding and offboarding processes.',
  ];

  return firstNames.map((first, i) => {
    const last = lastNames[i % lastNames.length];
    const name = `${first} ${last}`;
    const login = `${first}.${last}`;
    const seq = String(i + 11).padStart(3, '0');
    return {
      id: `${first}-${last}-${seq}`.toLowerCase(),
      name,
      status: statuses[i % statuses.length],
      description: descriptions[i % descriptions.length],
      email: `${first[0]}.${last}@acme.io`.toLowerCase(),
      objectId: `${seq}f${i}b2c4-7d9e-4f2a-b8c3-1d2e3f4a${seq}c`,
      details: makeDetails(name, login),
    };
  });
}

export const MOCK_USERS: User[] = [
  {
    id: 'isabella-clark',
    name: 'Isabella Clark',
    status: 'Active',
    description: 'Oversees enterprise-wide platform security strategy and operations.',
    email: 'i.patel@acme.io',
    objectId: 'b4e2c3d5-8f0a-5g3b-c9d4-2e1a3b4c5d6e',
    details: makeDetails('Isabella Clark', 'Isabella.Clark'),
  },
  {
    id: 'liam-bennett',
    name: 'Liam Bennett',
    status: 'Active',
    description: 'Manages global platform security policy and incident response.',
    email: 's.martinez@acme.io',
    objectId: 'c5f3d4e6-9g1b-6h4c-da5e-3f2b4c5d6e7f',
    details: makeDetails('Liam Bennett', 'Liam.Bennett'),
  },
  {
    id: 'sophia-martinez',
    name: 'Sophia Martinez',
    status: 'Active',
    description: 'Coordinates platform security across business units.',
    email: 'o.nguyen@acme.io',
    objectId: 'd6g4e5f7-0h2c-7i5d-eb6f-4a5b6c7d8e9f',
    details: makeDetails('Sophia Martinez', 'Sophia.Martinez'),
  },
  {
    id: 'noah-kim',
    name: 'Noah Kim',
    status: 'Active',
    description: 'Directs security operations and engineering teams.',
    email: 'n.kim@acme.io',
    objectId: 'a3f1b2c4-7d9e-4f2a-b8c3-1d2e3f4a5b6c',
    details: makeDetails('Noah Kim', 'Noah.Kim'),
  },
  {
    id: 'mason-patel',
    name: 'Mason Patel',
    status: 'Active',
    description: 'Leads platform security architecture and design.',
    email: 'a.thompson@acme.io',
    objectId: 'e7h5f6g8-1i3d-8j6e-fc7g-5b6c7d8e9f0a',
    details: makeDetails('Mason Patel', 'Mason.Patel'),
  },
  {
    id: 'olivia-nguyen',
    name: 'Olivia Nguyen',
    status: 'Active',
    description: 'Responsible for platform security compliance reporting.',
    email: 'e.brooks@acme.io',
    objectId: 'f8i6g7h9-2j4e-9k7f-gd8h-6c7d8e9f0a1b',
    details: makeDetails('Olivia Nguyen', 'Olivia.Nguyen'),
  },
  {
    id: 'ethan-brooks',
    name: 'Ethan Brooks',
    status: 'Inactive',
    description: 'Drives platform security enhancements and reviews.',
    email: 'i.clark@acme.io',
    objectId: 'g9j7h8i0-3k5f-0l8g-he9i-7d8e9f0a1b2c',
    // The Figma "Ethan Brooks (MKim)" example overrides the derived fields.
    details: {
      firstName: 'Markus',
      lastName: 'Kim',
      fullName: 'Markus Kim',
      displayName: 'MKim',
      initials: 'MK',
      longDescription: LOREM,
      login: 'Markus.Kim3',
      type: 'User',
      managementUnit: 'Management',
    },
  },
  {
    id: 'ava-thompson',
    name: 'Ava Thompson',
    status: 'Active',
    description: 'Leads cross-functional teams on identity initiatives.',
    email: 'l.bennett@acme.io',
    objectId: 'h0k8i9j1-4l6g-bm9h-if0j-8e9f0a1b2c3d',
    details: makeDetails('Ava Thompson', 'Ava.Thompson'),
  },
  {
    id: 'lucas-rivera',
    name: 'Lucas Rivera',
    status: 'Unknown',
    description: 'Develops and enforces platform-wide security policy.',
    email: 's.martinez@acme.io',
    objectId: 'i1l9j0k2-5m7h-cn0i-jg1k-9f0a1b2c3d4e',
    details: makeDetails('Lucas Rivera', 'Lucas.Rivera'),
  },
  {
    id: 'mia-foster',
    name: 'Mia Foster',
    status: 'Active',
    description: 'Oversees platform security operations and metrics.',
    email: 'm.foster@acme.io',
    objectId: 'j2m0k1l3-6n8i-do1j-kh2l-0a1b2c3d4e5f',
    details: makeDetails('Mia Foster', 'Mia.Foster'),
  },
  ...makeMockUsers(),
];

/** Lookup helpers. */
export function getUserById(id: string): User | null {
  return MOCK_USERS.find((u) => u.id === id) ?? null;
}

export function getUserIndex(id: string): number {
  return MOCK_USERS.findIndex((u) => u.id === id);
}

/** Index helper used by the in-memory store. */
export function findUserIndex(users: User[], id: string): number {
  return users.findIndex((u) => u.id === id);
}
