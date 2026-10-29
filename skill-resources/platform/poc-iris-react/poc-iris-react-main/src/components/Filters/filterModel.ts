/**
 * Filter domain model — pure, framework-free helpers for the advanced filter
 * builder. No React here so the tree edits and predicates stay unit-testable.
 *
 * A filter is a recursive tree: a `Group` joins its children with a single
 * boolean `op` (and/or); a `Condition` is `parameter · operator · value(s)`.
 */

/** A selectable value for an enum parameter (e.g. an object type). */
export interface FilterOption {
  value: string;
  label: string;
  /** Named icon from the shared manifest (uses `currentColor`). */
  icon?: string;
}

/** The 13 operators shown in the hi-fi operator dropdown. */
export type OperatorId =
  | 'eq'
  | 'neq'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'in'
  | 'nin'
  | 'contains'
  | 'ncontains'
  | 'matches'
  | 'wildcard'
  | 'empty';

export interface OperatorDef {
  id: OperatorId;
  label: string;
  /** Manifest glyph whose symbol matches the hi-fi. */
  icon: string;
}

/** Ordered exactly as the hi-fi `.Operator` dropdown lists them. */
export const OPERATORS: OperatorDef[] = [
  { id: 'eq', label: 'equals', icon: 'Equals' },
  { id: 'neq', label: 'not equals', icon: 'NotEquals' },
  { id: 'lt', label: 'less than', icon: 'LessThan' },
  { id: 'lte', label: 'less than or equals', icon: 'LessThanOrEqual' },
  { id: 'gt', label: 'greater than', icon: 'GreaterThan' },
  { id: 'gte', label: 'greater than or equals', icon: 'GreaterThanOrEqual' },
  { id: 'in', label: 'is one of', icon: 'MemberOf' },
  { id: 'nin', label: 'is not one of', icon: 'NotMemberOf' },
  { id: 'contains', label: 'contains', icon: 'SupersetOf' },
  { id: 'ncontains', label: 'does not contain', icon: 'NotSupersetOf' },
  { id: 'matches', label: 'matches', icon: 'ApproximateEquals' },
  { id: 'wildcard', label: 'wildcard', icon: 'Asterisk' },
  { id: 'empty', label: 'is empty', icon: 'Empty' },
];

export const OPERATOR_BY_ID: Record<OperatorId, OperatorDef> = OPERATORS.reduce(
  (acc, op) => {
    acc[op.id] = op;
    return acc;
  },
  {} as Record<OperatorId, OperatorDef>,
);

/**
 * A filterable parameter (left side of a condition). Whether a value editor is
 * a text box, a date picker, or a value list is derived from `options` / `date`.
 */
export interface ParameterDef {
  id: string;
  label: string;
  /** Lead glyph; omit for the "without icon" treatment shown in the hi-fi. */
  icon?: string;
  /** Enumerated values → the value editor offers this list. */
  options?: FilterOption[];
  /** Date parameter → the value editor renders a native date input. */
  date?: boolean;
}

export type BooleanOp = 'and' | 'or';

export interface Condition {
  kind: 'condition';
  id: string;
  /** Undefined → "Parameter" placeholder. */
  parameterId?: string;
  /** Undefined → "Operator" placeholder. */
  operatorId?: OperatorId;
  /** 0 = unset / `is empty`; 1 = single; N = comma-joined in the pill. */
  values: string[];
}

export interface Group {
  kind: 'group';
  id: string;
  /** Single connector applied between every child (matches the hi-fi). */
  op: BooleanOp;
  children: FilterNode[];
}

export type FilterNode = Condition | Group;

let idSeq = 0;
/** Monotonic id so React keys never collide across rapid add/remove. */
export function nextId(prefix = 'n'): string {
  idSeq += 1;
  return `${prefix}${idSeq}`;
}

export function newCondition(init: Partial<Omit<Condition, 'kind' | 'id'>> = {}): Condition {
  return {
    kind: 'condition',
    id: nextId('c'),
    parameterId: init.parameterId,
    operatorId: init.operatorId,
    values: init.values ?? [],
  };
}

export function newGroup(op: BooleanOp = 'and', children: FilterNode[] = []): Group {
  return { kind: 'group', id: nextId('g'), op, children };
}

/** `is empty` is the only operator that carries no value. */
export function operatorTakesValue(op: OperatorId | undefined): boolean {
  return op != null && op !== 'empty';
}

/** A condition is complete once it can actually filter. */
export function isConditionComplete(c: Condition): boolean {
  if (!c.parameterId || !c.operatorId) return false;
  if (!operatorTakesValue(c.operatorId)) return true;
  return c.values.length > 0;
}

/** Total number of conditions anywhere under a node. */
export function countConditions(node: FilterNode): number {
  if (node.kind === 'condition') return 1;
  return node.children.reduce((n, child) => n + countConditions(child), 0);
}

/** Depth-first first condition — the "lead" shown in a collapsed summary pill. */
export function firstCondition(node: FilterNode): Condition | null {
  if (node.kind === 'condition') return node;
  for (const child of node.children) {
    const found = firstCondition(child);
    if (found) return found;
  }
  return null;
}

/** Nesting depth of a node (a bare condition or empty group is depth 0). */
export function depthOf(node: FilterNode): number {
  if (node.kind === 'condition' || node.children.length === 0) return 0;
  return 1 + Math.max(...node.children.map(depthOf));
}

export interface Summary {
  lead: Condition | null;
  /** Conditions beyond the lead — powers "and N more conditions". */
  extraCount: number;
  op: BooleanOp;
}

/** Collapse a node to `{ lead, extraCount, op }` for the summary pill. */
export function summarize(node: FilterNode): Summary {
  const total = countConditions(node);
  return {
    lead: firstCondition(node),
    extraCount: Math.max(0, total - 1),
    op: node.kind === 'group' ? node.op : 'and',
  };
}

/* --- Immutable tree edits (keyed by id) -------------------------------- */

/** Return a new tree with `node.id === id` replaced by `updater(node)`. */
export function updateNode(
  root: Group,
  id: string,
  updater: (node: FilterNode) => FilterNode,
): Group {
  return mapTree(root, id, updater) as Group;
}

function mapTree(
  node: FilterNode,
  id: string,
  updater: (node: FilterNode) => FilterNode,
): FilterNode {
  if (node.id === id) return updater(node);
  if (node.kind === 'group') {
    return { ...node, children: node.children.map((c) => mapTree(c, id, updater)) };
  }
  return node;
}

/** Append `child` to the group identified by `parentId`. */
export function appendChild(root: Group, parentId: string, child: FilterNode): Group {
  return updateNode(root, parentId, (node) =>
    node.kind === 'group' ? { ...node, children: [...node.children, child] } : node,
  );
}

/** Remove the node with `id` (and prune it from its parent's children). */
export function removeNode(root: Group, id: string): Group {
  const prune = (group: Group): Group => ({
    ...group,
    children: group.children
      .filter((c) => c.id !== id)
      .map((c) => (c.kind === 'group' ? prune(c) : c)),
  });
  return prune(root);
}

/** Flip a group's boolean connector. */
export function setGroupOp(root: Group, id: string, op: BooleanOp): Group {
  return updateNode(root, id, (node) => (node.kind === 'group' ? { ...node, op } : node));
}

/** Find a node by id (read-only). */
export function findNode(root: FilterNode, id: string): FilterNode | null {
  if (root.id === id) return root;
  if (root.kind === 'group') {
    for (const child of root.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }
  return null;
}

/* --- Serialization (backend-ready; wiring deferred) -------------------- */

export function serialize(node: FilterNode): string {
  return JSON.stringify(node);
}

export function deserialize(json: string): FilterNode {
  return JSON.parse(json) as FilterNode;
}
