/**
 * directoryData — mock directory objects for the Tree view.
 *
 * Kept deliberately **separate** from the flat Users mock (`mockUsers.ts` /
 * `usersStore.tsx`) so the existing Users pages are untouched. A node's leaf
 * contents are generated **deterministically** from a seed derived from the
 * node id, so ids/names stay stable across navigations, reloads, deep-links,
 * and the detail prev/next pager — without shipping a giant static array.
 */

export type DirectoryObjectType =
  | 'ou'
  | 'container'
  | 'user'
  | 'computer'
  | 'group'
  | 'contact'
  | 'gmsa';

export interface DirectoryObjectDetails {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  userPrincipalName?: string;
  authorizationInfo?: string;
  description: string;
  created?: string;
  memberCount?: number;
  location?: string;
}

export interface DirectoryObject {
  id: string;
  name: string;
  type: DirectoryObjectType;
  description: string;
  /** The containing node's id. */
  parentId: string;
  /** Container rows drill in (they are themselves tree nodes); leaves open detail. */
  isContainer: boolean;
  details: DirectoryObjectDetails;
}

/** Presentation metadata per object type (label + shared-manifest icon). */
export const OBJECT_TYPE_META: Record<DirectoryObjectType, { label: string; icon: string }> = {
  ou: { label: 'Organizational Unit', icon: 'Folder' },
  container: { label: 'Container', icon: 'Folder' },
  user: { label: 'User', icon: 'User' },
  computer: { label: 'Computer', icon: 'Devices' },
  group: { label: 'Group', icon: 'UsersThree' },
  contact: { label: 'Contact', icon: 'AddressBook' },
  gmsa: { label: 'Group Management Service Account', icon: 'UserCircle' },
};

/* ------------------------------------------------------------------ */
/*  Static node tree (mirrors the Figma / screenshots)                */
/* ------------------------------------------------------------------ */

interface RawNode {
  id: string;
  name: string;
  type: 'ou' | 'container';
  description: string;
  icon?: string;
  /** How many leaf objects to synthesize for this node's listing. */
  leafCount?: number;
  children?: RawNode[];
}

const TREE: RawNode[] = [
  { id: 'access-templates', name: 'Access Templates', type: 'container', description: 'Reusable access-control templates.', icon: 'UserCircleCheck', leafCount: 24 },
  { id: 'managed-units', name: 'Managed Units', type: 'container', description: 'Delegated administrative units.', icon: 'FolderStar', leafCount: 18 },
  {
    id: 'managed-directories',
    name: 'Managed Directories',
    type: 'container',
    description: 'Directories under management.',
    icon: 'UserCircleCheck',
    children: [
      {
        id: 'active-directories',
        name: 'Active Directories',
        type: 'container',
        description: 'On-premises Active Directory forests.',
        children: [
          {
            id: 'o1d-local',
            name: 'O1D.local',
            type: 'container',
            description: 'Primary AD forest.',
            icon: 'SquaresFour',
            children: [
              { id: 'o1d-builtin', name: 'Builtin', type: 'ou', description: 'Built-in security principals.', leafCount: 32 },
              { id: 'o1d-dg-tests', name: 'DG-Tests', type: 'ou', description: 'Delegation test objects.', leafCount: 46 },
              { id: 'o1d-domain-controllers', name: 'Domain Controllers', type: 'ou', description: 'Domain controller computers.', leafCount: 12 },
              { id: 'o1d-foreign-security', name: 'Foreign Security Principals', type: 'ou', description: 'Cross-forest principals.', leafCount: 8 },
              { id: 'o1d-keys', name: 'Keys', type: 'ou', description: 'Key credential objects.', leafCount: 15 },
              { id: 'o1d-managed-service-accounts', name: 'Managed Service Accounts', type: 'ou', description: 'gMSA accounts.', leafCount: 21 },
              { id: 'o1d-program-data', name: 'Program Data', type: 'ou', description: 'Application-created objects.', leafCount: 63 },
              { id: 'o1d-system', name: 'System', type: 'ou', description: 'System containers.', leafCount: 40 },
              {
                id: 'o1d-test-ou',
                name: 'Test OU',
                type: 'ou',
                description: 'Sandbox organizational unit.',
                leafCount: 2308,
                children: [
                  { id: 'o1d-test-ou-test1', name: 'Test1', type: 'ou', description: 'TestOU 1', leafCount: 34 },
                  { id: 'o1d-test-ou-test2', name: 'Test2', type: 'ou', description: 'TestOU 2', leafCount: 27 },
                ],
              },
              { id: 'o1d-ad-lds', name: 'AD LDS', type: 'ou', description: 'Lightweight directory partitions.', leafCount: 19 },
            ],
          },
          { id: 'o2d-local', name: 'O2D.local', type: 'container', description: 'Secondary AD forest.', icon: 'SquaresFour', leafCount: 54 },
        ],
      },
      {
        id: 'entra-directories',
        name: 'Entra Directories',
        type: 'container',
        description: 'Microsoft Entra ID tenants.',
        children: [
          { id: 'entra-3bf67d', name: '3bf67d.onmicrosoft.com', type: 'container', description: 'Primary Entra tenant.', icon: 'SquaresFour', leafCount: 128 },
        ],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Indexes (built once)                                              */
/* ------------------------------------------------------------------ */

const nodeById = new Map<string, RawNode>();
const parentIdByNode = new Map<string, string | null>();

function indexTree(nodes: RawNode[], parentId: string | null): void {
  for (const n of nodes) {
    nodeById.set(n.id, n);
    parentIdByNode.set(n.id, parentId);
    if (n.children) indexTree(n.children, n.id);
  }
}
indexTree(TREE, null);

export interface DirectoryNodeView {
  id: string;
  name: string;
  icon?: string;
  hasChildren: boolean;
  children: DirectoryNodeView[];
}

function toNodeView(n: RawNode): DirectoryNodeView {
  return {
    id: n.id,
    name: n.name,
    icon: n.icon,
    hasChildren: !!(n.children && n.children.length),
    children: (n.children ?? []).map(toNodeView),
  };
}

/** The node tree shaped for rendering the sidebar `Tree`. */
export const NODE_TREE: DirectoryNodeView[] = TREE.map(toNodeView);

/** The first (top-of-tree) node — the default selection for the Tree view. */
export const FIRST_NODE_ID: string = NODE_TREE[0].id;

/** Every container node id, depth-first — used to fully unfurl the tree. */
export const ALL_NODE_IDS: string[] = (() => {
  const ids: string[] = [];
  const walk = (nodes: DirectoryNodeView[]): void => {
    for (const n of nodes) {
      ids.push(n.id);
      if (n.children.length) walk(n.children);
    }
  };
  walk(NODE_TREE);
  return ids;
})();

export function getNode(nodeId: string): RawNode | undefined {
  return nodeById.get(nodeId);
}

/** Tile icon for a node (its own icon, else a folder). */
export function getNodeIcon(nodeId: string): string {
  return nodeById.get(nodeId)?.icon ?? 'Folder';
}

export function isContainerNode(nodeId: string): boolean {
  return nodeById.has(nodeId);
}

/** Ancestor chain (root → node), used for breadcrumbs + tree auto-expand. */
export function getNodePath(nodeId: string): RawNode[] {
  const path: RawNode[] = [];
  let cur: string | null | undefined = nodeId;
  while (cur) {
    const n = nodeById.get(cur);
    if (!n) break;
    path.unshift(n);
    cur = parentIdByNode.get(cur) ?? null;
  }
  return path;
}

/* ------------------------------------------------------------------ */
/*  Deterministic leaf generation                                     */
/* ------------------------------------------------------------------ */

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 — tiny deterministic PRNG. */
function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = [
  'Peter', 'Elena', 'Clara', 'Nadia', 'Oliver', 'Aron', 'Natalie', 'Markus', 'Sofia', 'Owen',
  'Amelia', 'Benjamin', 'Charlotte', 'James', 'Evelyn', 'Henry', 'Abigail', 'Alexander', 'Emily',
  'Sebastian', 'Jack', 'Avery', 'Daniel', 'Ella', 'Matthew', 'Scarlett', 'Grace', 'Chloe', 'David',
  'Victoria', 'Carter', 'Riley', 'Julian', 'Lily', 'Leo', 'Zoe', 'Nora', 'Dylan', 'Hazel', 'Layla',
];
const LAST_NAMES = [
  'Kim', 'Vasquez', 'Webb', 'Patel', 'Tanaka', 'Estevez', 'Hughes', 'Coleman', 'Jenkins', 'Perry',
  'Powell', 'Long', 'Patterson', 'Flores', 'Washington', 'Butler', 'Simmons', 'Foster', 'Gonzales',
  'Bryant', 'Russell', 'Griffin', 'Diaz', 'Hayes', 'Myers', 'Ford', 'Hamilton', 'Graham', 'Wallace',
];
const DESCRIPTIONS = [
  'Oversees platform administration.',
  'UI/motion designer specializing in micro-interactions and design systems at scale.',
  'Trial user who signed up via referral. Has not logged in for over 60 days.',
  'Account suspended following repeated policy violations. Access revoked on Apr 2025.',
  'Leads platform engineering, oversees infra and security compliance across all regions.',
  'Manages CI/CD pipelines and cloud cost optimization. AWS certified architect.',
];
const LEAF_TYPES: DirectoryObjectType[] = [
  'user', 'user', 'user', 'user', 'computer', 'computer', 'group', 'contact',
];

const pick = <T,>(rng: () => number, arr: T[]): T => arr[Math.floor(rng() * arr.length)];

function makeLeaf(node: RawNode, index: number, rng: () => number, path: string): DirectoryObject {
  const type = pick(rng, LEAF_TYPES);
  const description = pick(rng, DESCRIPTIONS);
  const id = `${node.id}-o${index}`;

  if (type === 'computer') {
    const num = 100 + Math.floor(rng() * 900);
    const kind = pick(rng, ['Computer', 'Device', 'Operator computer', 'Workstation']);
    const name = kind.endsWith('computer') ? kind : `${kind} ${String(num).padStart(3, '0')}`;
    return {
      id, name, type, description, parentId: node.id, isContainer: false,
      details: { description, location: path, created: '2024-11-02' },
    };
  }
  if (type === 'group') {
    const name = `${pick(rng, ['Security', 'Access', 'Admin', 'Ops', 'Finance'])} ${pick(rng, ['Users', 'Admins', 'Readers', 'Owners'])}`;
    return {
      id, name, type, description, parentId: node.id, isContainer: false,
      details: { description, location: path, memberCount: 1 + Math.floor(rng() * 40), created: '2024-08-14' },
    };
  }
  // user / contact
  const firstName = pick(rng, FIRST_NAMES);
  const lastName = pick(rng, LAST_NAMES);
  const name = `${firstName} ${lastName}`;
  const initialsName = `${firstName[0]}${lastName}`;
  const domain = path.split(' / ').slice(-2)[0]?.replace(/\s+/g, '') ?? 'O1D.Local';
  return {
    id,
    name,
    type,
    description,
    parentId: node.id,
    isContainer: false,
    details: {
      firstName,
      lastName,
      displayName: initialsName,
      userPrincipalName: `${initialsName}@${domain}`,
      authorizationInfo: '',
      description,
      location: path,
      created: '2025-01-09',
    },
  };
}

const leafCache = new Map<string, DirectoryObject[]>();

function getLeaves(node: RawNode): DirectoryObject[] {
  const cached = leafCache.get(node.id);
  if (cached) return cached;
  const count = node.leafCount ?? 0;
  const rng = makeRng(hashSeed(node.id));
  const path = getNodePath(node.id).map((n) => n.name).join(' / ');
  const leaves: DirectoryObject[] = [];
  for (let i = 0; i < count; i += 1) leaves.push(makeLeaf(node, i, rng, path));
  leafCache.set(node.id, leaves);
  return leaves;
}

/** Convert a child node into a container `DirectoryObject` (a drill-in row). */
function nodeAsObject(n: RawNode): DirectoryObject {
  return {
    id: n.id,
    name: n.name,
    type: n.type,
    description: n.description,
    parentId: parentIdByNode.get(n.id) ?? '',
    isContainer: true,
    details: { description: n.description, location: getNodePath(n.id).map((p) => p.name).join(' / ') },
  };
}

/**
 * Contents of a node: child containers (navigable rows) followed by the
 * synthesized leaf objects. Stable across calls (memoized generation).
 */
export function getChildren(nodeId: string): DirectoryObject[] {
  const node = nodeById.get(nodeId);
  if (!node) return [];
  const containers = (node.children ?? []).map(nodeAsObject);
  return [...containers, ...getLeaves(node)];
}

/** Leaf objects only — the set the detail prev/next pager iterates. */
export function getLeafObjects(nodeId: string): DirectoryObject[] {
  const node = nodeById.get(nodeId);
  return node ? getLeaves(node) : [];
}

export function getObject(nodeId: string, objectId: string): DirectoryObject | undefined {
  return getChildren(nodeId).find((o) => o.id === objectId);
}
