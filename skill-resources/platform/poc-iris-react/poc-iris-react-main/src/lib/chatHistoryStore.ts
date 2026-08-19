/**
 * chatHistoryStore — tiny localStorage wrapper for AI panel conversations.
 *
 * Storage layout (per-vertical):
 *   key:   `iris.ai.history.v1.{verticalId}`
 *   value: `{ version: 1, conversations: ChatConversation[] }` (JSON)
 *
 * Per-vertical scoping mirrors the existing AiPanel reset-on-vertical-
 * change behaviour and keeps reads cheap when a single vertical has a
 * lot of conversations.
 *
 * Failure model: every function is best-effort. Missing/disabled
 * localStorage (private mode, embedded webviews, SSR), JSON parse
 * errors, and quota errors all degrade silently so the panel never
 * throws because of a persistence problem.
 */

import type { Message } from '../components/AiPanel/AiPanel.js';

export interface ChatConversation {
  id: string;
  verticalId: string;
  /** Truncated first user message — derived once and not re-computed. */
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

/** Hard cap per vertical. localStorage's origin quota is ~5 MB but a
 *  user really doesn't need a thousand conversations in the dropdown,
 *  and capping here keeps writes O(50). */
const MAX_CONVERSATIONS = 50;
const SCHEMA_VERSION = 1;

const storageKey = (verticalId: string) => `iris.ai.history.v${SCHEMA_VERSION}.${verticalId}`;

/** Probes window + localStorage in a try/catch — some embedded webviews
 *  throw on the access itself rather than on read/write. */
function isAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return 'localStorage' in window && window.localStorage !== null;
  } catch {
    return false;
  }
}

function readPayload(verticalId: string): ChatConversation[] {
  if (!isAvailable()) return [];
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(storageKey(verticalId));
  } catch {
    return [];
  }
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Corrupt JSON — drop this key so we don't keep failing on it.
    try {
      window.localStorage.removeItem(storageKey(verticalId));
    } catch {
      /* no-op */
    }
    return [];
  }
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    (parsed as { version?: unknown }).version !== SCHEMA_VERSION ||
    !Array.isArray((parsed as { conversations?: unknown }).conversations)
  ) {
    return [];
  }
  // Validate each entry before handing it to the UI. Any persisted blob
  // can be tampered with (manual localStorage edits, partial writes from
  // an older build, JSON injected by a future schema, etc.); silently
  // dropping malformed rows is safer than letting them crash the render
  // path (e.g. `c.title.toLowerCase()` in HistoryList on `null`).
  const entries = (parsed as { conversations: unknown[] }).conversations;
  const valid: ChatConversation[] = [];
  for (const entry of entries) {
    if (isChatConversation(entry)) valid.push(entry);
  }
  // Re-assert the newest-first contract here rather than trusting the
  // stored order — `saveConversation` always writes sorted, but a hand-
  // edited blob or an older format could be in any order.
  valid.sort((a, b) => b.updatedAt - a.updatedAt);
  return valid;
}

/** Structural guard for a stored conversation. Intentionally shallow:
 *  validates the fields the UI reads (id, title, timestamps, messages
 *  array) but does not recurse into individual messages — a malformed
 *  message at most causes that bubble to render as empty, which is
 *  preferable to dropping an otherwise-readable transcript. */
function isChatConversation(value: unknown): value is ChatConversation {
  if (typeof value !== 'object' || value === null) return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.id === 'string' &&
    typeof c.verticalId === 'string' &&
    typeof c.title === 'string' &&
    typeof c.createdAt === 'number' &&
    Number.isFinite(c.createdAt) &&
    typeof c.updatedAt === 'number' &&
    Number.isFinite(c.updatedAt) &&
    Array.isArray(c.messages)
  );
}

function writePayload(verticalId: string, conversations: ChatConversation[]): void {
  if (!isAvailable()) return;
  const serialise = (list: ChatConversation[]) =>
    JSON.stringify({ version: SCHEMA_VERSION, conversations: list });
  try {
    window.localStorage.setItem(storageKey(verticalId), serialise(conversations));
    return;
  } catch {
    // Likely QuotaExceededError. Drop the oldest half and try once more
    // — if even that fails we silently give up rather than crash the UI.
    try {
      const trimmed = conversations.slice(0, Math.floor(MAX_CONVERSATIONS / 2));
      window.localStorage.setItem(storageKey(verticalId), serialise(trimmed));
    } catch {
      /* give up silently */
    }
  }
}

/** All conversations for `verticalId`, newest first. */
export function listConversations(verticalId: string): ChatConversation[] {
  return readPayload(verticalId);
}

/** Upsert a conversation. Caller owns id + timestamps; this function
 *  only normalises sort order and enforces the cap. */
export function saveConversation(verticalId: string, conv: ChatConversation): void {
  const existing = readPayload(verticalId);
  const idx = existing.findIndex((c) => c.id === conv.id);
  const merged =
    idx === -1 ? [conv, ...existing] : existing.map((c) => (c.id === conv.id ? conv : c));
  merged.sort((a, b) => b.updatedAt - a.updatedAt);
  writePayload(verticalId, merged.slice(0, MAX_CONVERSATIONS));
}

export function deleteConversation(verticalId: string, id: string): void {
  const next = readPayload(verticalId).filter((c) => c.id !== id);
  writePayload(verticalId, next);
}
