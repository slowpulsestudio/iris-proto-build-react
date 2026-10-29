import { useCallback, useMemo, useState } from 'react';
import {
  appendChild,
  newCondition,
  newGroup,
  removeNode,
  setGroupOp,
  updateNode,
  type BooleanOp,
  type Condition,
  type FilterNode,
  type Group,
  type OperatorId,
} from './filterModel.js';

export interface FilterModelActions {
  /** Append a blank (or preset) condition to a group. */
  addCondition: (parentId: string, preset?: Partial<Condition>) => void;
  /** Append a nested group to a group. */
  addGroup: (parentId: string, op?: BooleanOp) => void;
  /** Patch a single condition (parameter / operator / values). */
  updateCondition: (id: string, patch: Partial<Omit<Condition, 'kind' | 'id'>>) => void;
  /** Remove any node (condition or group) by id. */
  remove: (id: string) => void;
  /** Flip a group's and/or connector. */
  setOp: (id: string, op: BooleanOp) => void;
  /** Reset back to an empty root group. */
  clear: () => void;
}

export interface FilterModel {
  root: Group;
  actions: FilterModelActions;
}

/**
 * useFilterModel — owns the filter tree and exposes immutable edit actions.
 * State stays per-view (as before); nothing touches the data stores.
 */
export function useFilterModel(initial?: Group): FilterModel {
  const [root, setRoot] = useState<Group>(() => initial ?? newGroup('and'));

  const addCondition = useCallback((parentId: string, preset?: Partial<Condition>) => {
    setRoot((r) => appendChild(r, parentId, newCondition(preset)));
  }, []);

  const addGroup = useCallback((parentId: string, op: BooleanOp = 'and') => {
    setRoot((r) => appendChild(r, parentId, newGroup(op)));
  }, []);

  const updateCondition = useCallback(
    (id: string, patch: Partial<Omit<Condition, 'kind' | 'id'>>) => {
      setRoot((r) =>
        updateNode(r, id, (node) =>
          node.kind === 'condition' ? { ...node, ...patch } : node,
        ),
      );
    },
    [],
  );

  const remove = useCallback((id: string) => {
    setRoot((r) => removeNode(r, id));
  }, []);

  const setOp = useCallback((id: string, op: BooleanOp) => {
    setRoot((r) => setGroupOp(r, id, op));
  }, []);

  const clear = useCallback(() => setRoot(newGroup('and')), []);

  const actions = useMemo<FilterModelActions>(
    () => ({ addCondition, addGroup, updateCondition, remove, setOp, clear }),
    [addCondition, addGroup, updateCondition, remove, setOp, clear],
  );

  return { root, actions };
}

export type { FilterNode };
