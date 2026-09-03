import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type Ref,
  type TransitionEvent,
} from 'react';
import { BorderBeam } from 'border-beam';
import { cx } from '../../lib/cx.js';
import { useAppShell } from '../../lib/appShellContext.js';
import type { AiContextItem } from '../../lib/aiContext.js';
import { SUGGESTED_PROMPTS, CONTEXT_PROMPTS, type SuggestedPrompt } from '../../lib/aiPrompts.js';
import { useVertical } from '../../lib/verticals.js';
import {
  type ChatConversation,
  deleteConversation,
  listConversations,
  saveConversation,
} from '../../lib/chatHistoryStore.js';
import { Icon } from '../Icon/Icon.js';
import { IconButton } from '../IconButton/IconButton.js';
import { TextInput } from '../TextInput/TextInput.js';
import { Toast } from '../Toast/Toast.js';
import { Tooltip } from '../Tooltip/Tooltip.js';
import styles from './AiPanel.module.css';

export type MessageRole = 'user' | 'assistant';

export interface RichBlockParagraph {
  type: 'p';
  text: string;
}

export interface RichBlockOrderedList {
  type: 'ol';
  items: string[];
}

export interface RichBlockCode {
  type: 'code';
  code: string;
  language?: string;
}

export interface RichBlockTable {
  type: 'table';
  columns: string[];
  rows: string[][];
}

export interface SourceLink {
  label: string;
  href?: string;
}

export interface RichBlockSources {
  type: 'sources';
  links: SourceLink[];
}

export type RichBlock =
  | RichBlockParagraph
  | RichBlockOrderedList
  | RichBlockCode
  | RichBlockTable
  | RichBlockSources;

export interface TextMessage {
  id: string;
  role: MessageRole;
  kind: 'text';
  content: string;
  /** Inline attachments shown above the bubble (e.g. selected rows that were
   *  attached at send time). User messages only. */
  attachments?: AiContextItem[];
}

export interface RichMessage {
  id: string;
  role: MessageRole;
  kind: 'rich';
  content: RichBlock[];
}

export type Message = TextMessage | RichMessage;

export type CannedReply =
  | { kind: 'text'; content: string }
  | { kind: 'rich'; content: RichBlock[] };

/** Per-message rating + inline feedback-panel state. See `feedback` in
 *  `AiPanel` for lifecycle notes. */
interface FeedbackEntry {
  rating: 'up' | 'down';
  /** Whether the inline feedback panel (heading + textarea + suggestion
   *  chips) is currently open. Set true when a thumb is first clicked; on
   *  submit the property is cleared (left `undefined`, so the panel closes
   *  while the thumb stays active and the rating remains visible), and the
   *  whole entry is deleted on dismiss. */
  panelOpen?: boolean;
}

export interface AiPanelProps {
  open: boolean;
  onClose: () => void;
  className?: string;
}

const AI_PANEL_WIDTH_DEFAULT = 452;
const AI_PANEL_WIDTH_MAX_CAP = 720;

function getAiPanelMaxWidth() {
  return Math.max(AI_PANEL_WIDTH_DEFAULT, Math.min(window.innerWidth * 0.33, AI_PANEL_WIDTH_MAX_CAP));
}

function clampAiPanelWidth(value: number) {
  return Math.min(getAiPanelMaxWidth(), Math.max(AI_PANEL_WIDTH_DEFAULT, value));
}

/**
 * AiPanel — the inline "Ask AI" chat panel that docks to the right
 * of the main content area. Returns `null` when `open` is false.
 *
 *   <AiPanel open={aiOpen} onClose={() => setAiOpen(false)} />
 *
 * Interactions are modelled on common AI chat surfaces (ChatGPT, Claude,
 * Gemini): typing indicator, streamed reveal of assistant replies, stop-
 * generating, hover-revealed message actions, copy confirmation, suggestion
 * chips on first open, scroll-to-bottom FAB, auto-growing composer with hint,
 * and `prefers-reduced-motion` fallbacks throughout.
 *
 * Content is placeholder — `DUMMY_REPLIES` cycle on each send.
 */
export function AiPanel({ open, onClose, className }: AiPanelProps) {
  const { aiContext, setAiContext, clearAiContext, pendingAiPrompt, setPendingAiPrompt } =
    useAppShell();
  const vertical = useVertical();
  const aiTitle = vertical.aiTitle;
  // Empty by default: the panel opens into the "Meet {aiTitle}" empty
  // state (heading + suggestion chips anchored to the composer). The first
  // user send populates the transcript; the empty state never reappears
  // until a vertical switch clears messages back to [].
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [stream, setStream] = useState<StreamState | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  // Per-message thumbs-up / thumbs-down state. Ephemeral — not persisted to
  // the chat-history store; switching conversations or starting a new one
  // clears it. `panelOpen` gates the inline feedback panel (heading +
  // textarea + suggestion chips); after a submit it flips false while
  // `rating` persists so the thumb stays active.
  const [feedback, setFeedback] = useState<Record<string, FeedbackEntry>>({});
  // Single global toast surface for the panel. Setting a non-null message
  // arms the Toast component's auto-dismiss timer.
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [panelWidth, setPanelWidth] = useState(AI_PANEL_WIDTH_DEFAULT);
  const [panelDragging, setPanelDragging] = useState(false);

  // Voice-recording flow: `recording` = mic open + waveform UI; `transcribing`
  // = post-stop, simulated transcription delay before the placeholder voice
  // message is dispatched. `recordingStartedAt` + `recordingNow` drive the
  // mm:ss timer in <RecordingTimeline>.
  const [recording, setRecording] = useState(false);
  const [recordingStartedAt, setRecordingStartedAt] = useState<number | null>(null);
  const [recordingNow, setRecordingNow] = useState(0);
  const [transcribing, setTranscribing] = useState(false);

  // Two-view panel: the conversation surface (‘chat’) and the saved-
  // conversation list (‘history’). The header back arrow toggles between
  // them. View state is local — the panel unmounts on close, so a fresh
  // open always returns to ‘chat’, matching the Figma default.
  const [view, setView] = useState<'chat' | 'history'>('chat');
  const [conversations, setConversations] = useState<ChatConversation[]>(() =>
    listConversations(vertical.id),
  );

  const reduceMotion = usePrefersReducedMotion();

  const replyIdxRef = useRef(0);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transcribeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizeCleanupRef = useRef<(() => void) | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  // Whether the conversation is currently "pinned" to the bottom. Captured
  // from the user's own scrolling (see `handleBodyScroll`) so the auto-scroll
  // effect can decide *before* new content grows the transcript. Measuring
  // after growth breaks for atomic blocks (code / table) that add a large
  // chunk in a single commit — the post-growth distance jumps past the
  // threshold, which would otherwise cancel the follow.
  const stickToBottomRef = useRef(true);

  // Monotonic message id, scoped to this component instance.
  const idCounterRef = useRef(0);
  const makeId = () => {
    idCounterRef.current += 1;
    return `m-${idCounterRef.current}`;
  };

  // History bookkeeping. Stored in refs (not state) so updates inside the
  // auto-save effect don't re-trigger the effect — the effect's job is to
  // *react* to message changes, not to its own metadata. `skipNextSaveRef`
  // suppresses the save that would otherwise fire on the messages-replace
  // triggered by loading a conversation from history.
  const activeConvIdRef = useRef<string | null>(null);
  const activeConvCreatedAtRef = useRef<number | null>(null);
  const skipNextSaveRef = useRef(false);

  // Mirrors `open` so async callbacks (the typing timer) can check it without
  // becoming stale closures.
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(
    () => () => {
      resizeCleanupRef.current?.();
    },
    [],
  );

useEffect(() => {
  const onResize = () => {
    setPanelWidth((prev) => clampAiPanelWidth(prev));
  };
  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);
}, []);

useEffect(() => {
  if (!open) {
    resizeCleanupRef.current?.();
    setPanelDragging(false);
  }
}, [open]);

  // Seed the composer once when a caller opens the panel with a pending prompt
  // (e.g. an Identity Home suggestion pill). Fills but does not send, then
  // clears the pending value so it fires exactly once. Keying on both `open`
  // and `pendingAiPrompt` also covers the panel already being open.
  useEffect(() => {
    if (!open || !pendingAiPrompt) return;
    setInput(pendingAiPrompt);
    setPendingAiPrompt(null);
  }, [open, pendingAiPrompt, setPendingAiPrompt]);

  const handleResizePointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startWidth = panelWidth;
    const pointerId = e.pointerId;
    const handle = e.currentTarget;
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    const previousRootCursor = document.documentElement.style.cursor;
    let dragged = false;

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.documentElement.style.cursor = 'col-resize';
    handle.setPointerCapture(pointerId);

    const cleanup = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      if (handle.hasPointerCapture(pointerId)) {
        handle.releasePointerCapture(pointerId);
      }
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      document.documentElement.style.cursor = previousRootCursor;
      resizeCleanupRef.current = null;
    };

    const finish = () => {
      cleanup();
      if (dragged) setPanelDragging(false);
    };

    const onPointerMove = (event: PointerEvent) => {
      const delta = startX - event.clientX;
      if (!dragged && Math.abs(delta) >= 3) {
        dragged = true;
        setPanelDragging(true);
      }
      if (!dragged) return;
      setPanelWidth(clampAiPanelWidth(startWidth + delta));
    };

    const onPointerUp = () => {
      finish();
    };

    const onPointerCancel = () => {
      finish();
    };

    resizeCleanupRef.current = cleanup;
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);
  };

  const panelStyle = {
    '--ai-panel-width': `${panelWidth}px`,
  } as CSSProperties & Record<'--ai-panel-width', string>;

  // Each vertical has its own AI brand (`aiTitle`). Because this component
  // stays mounted across navigations (it returns `null` when closed rather
  // than unmounting), the initial greeting — which embeds `aiTitle` — and the
  // entire transcript would otherwise persist across a vertical switch. Reset
  // the conversation when the vertical changes so the panel always reflects
  // the active assistant. The first-mount case is skipped via a ref.
  const prevVerticalIdRef = useRef(vertical.id);
  useEffect(() => {
    if (prevVerticalIdRef.current === vertical.id) return;
    prevVerticalIdRef.current = vertical.id;
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    // Voice flow lives in the same composer, so a vertical switch must also
    // drop any in-flight recording/transcription — otherwise the composer
    // can be stuck in `recording`/`processing` with no way to recover.
    if (transcribeTimerRef.current) {
      clearTimeout(transcribeTimerRef.current);
      transcribeTimerRef.current = null;
    }
    // The copy-confirmation tick fires ~1.5s after a click; if the user
    // switches verticals inside that window the timer would still fire
    // and set `copiedId` on the new vertical's (empty) state. Cancel it.
    if (copyTimerRef.current) {
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = null;
    }
    // The auto-save effect below also depends on `vertical.id` and will
    // fire in the same effect-flush as this one — but with the OLD
    // `messages` still in its closure (state updates haven't applied
    // yet). Without this guard it would write the previous vertical's
    // transcript into the new vertical's storage under a fresh id.
    skipNextSaveRef.current = true;
    setMessages([]);
    setStream(null);
    setIsTyping(false);
    setInput('');
    setRecording(false);
    setRecordingStartedAt(null);
    setTranscribing(false);
    setCopiedId(null);
    // Feedback state is per-message and ephemeral. Clearing here matches
    // the rest of the reset semantics: the new vertical opens with no
    // stale thumb states or open inline panels from the previous chat.
    setFeedback({});
    setToastMessage(null);
    replyIdxRef.current = 0;
    idCounterRef.current = 0;
    // Detach from any history entry from the previous vertical, refresh
    // the list to reflect the new vertical's storage key, and bounce back
    // to chat view in case the user was browsing history when switching.
    activeConvIdRef.current = null;
    activeConvCreatedAtRef.current = null;
    setConversations(listConversations(vertical.id));
    setView('chat');
  }, [vertical.id]);

  /* ── Streaming ticker ─────────────────────────────────────────── */

  // Advance the reveal. The updater MUST be pure — under React strict mode
  // it can run twice per dispatch, so finalisation lives in a separate
  // effect below to avoid double-appending the target message.
  useEffect(() => {
    if (!stream) return;
    const id = window.setInterval(() => {
      setStream((s) => {
        if (!s) return s;
        if (s.progress >= s.total) return s;
        const next = Math.min(s.progress + STREAM_CHARS_PER_TICK, s.total);
        return { ...s, progress: next };
      });
    }, STREAM_TICK_MS);
    return () => window.clearInterval(id);
  }, [stream?.target.id]);

  // Finalise when the stream has fully revealed: append the target into the
  // message log exactly once and clear the stream.
  useEffect(() => {
    if (!stream || stream.progress < stream.total) return;
    const target = stream.target;
    setStream(null);
    setMessages((prev) => [...prev, target]);
  }, [stream]);

  // Auto-scroll the conversation to the bottom only when the user is already
  // near the bottom — preserves their position if they've scrolled up to read.
  // `stickToBottomRef` reflects the pre-growth position, so this keeps
  // following even when an atomic code/table block lands all at once.
  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    if (stickToBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isTyping, stream?.progress]);

  // Cancel any pending reply if the panel closes mid-typing so the user
  // doesn't get a "phantom" reply the next time they open it.
  useEffect(() => {
    if (open) return;
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    setIsTyping(false);
    setStream(null);
  }, [open]);

  // Clean up any pending timers on unmount.
  useEffect(
    () => () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      if (transcribeTimerRef.current) clearTimeout(transcribeTimerRef.current);
    },
    [],
  );

  // Tick `recordingNow` four times a second so the timer label updates
  // without re-rendering everything every frame.
  useEffect(() => {
    if (!recording) return;
    const id = window.setInterval(() => setRecordingNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [recording]);

  // If the panel closes mid-recording or mid-transcription, drop both so the
  // user doesn't return to a stuck busy state.
  useEffect(() => {
    if (open) return;
    setRecording(false);
    setRecordingStartedAt(null);
    setTranscribing(false);
    if (transcribeTimerRef.current) {
      clearTimeout(transcribeTimerRef.current);
      transcribeTimerRef.current = null;
    }
  }, [open]);

  const isGenerating = isTyping || !!stream;
  const recordingElapsedMs =
    recordingStartedAt !== null ? Math.max(0, recordingNow - recordingStartedAt) : 0;

  const startRecording = () => {
    if (isGenerating || transcribing) return;
    const now = Date.now();
    setRecording(true);
    setRecordingStartedAt(now);
    setRecordingNow(now);
  };

  const cancelRecording = () => {
    setRecording(false);
    setRecordingStartedAt(null);
  };

  const sendMessage = useCallback(
    (override?: string) => {
      const text = (override ?? input).trim();
      if (!text || isGenerating) return;
      // Capture and consume any pending attachments — they ride along with
      // this message only; subsequent turns continue without re-attaching.
      const attachments = aiContext.length > 0 ? aiContext : undefined;
      setMessages((prev) => [
        ...prev,
        { id: makeId(), role: 'user', kind: 'text', content: text, attachments },
      ]);
      if (attachments) clearAiContext();
      setInput('');
      setIsTyping(true);

      typingTimerRef.current = setTimeout(() => {
        typingTimerRef.current = null;
        if (!openRef.current) {
          setIsTyping(false);
          return;
        }
        const reply = DUMMY_REPLIES[replyIdxRef.current % DUMMY_REPLIES.length];
        replyIdxRef.current += 1;
        const target: Message = {
          id: makeId(),
          role: 'assistant',
          ...reply,
        } as Message;
        setIsTyping(false);
        if (reduceMotion) {
          setMessages((prev) => [...prev, target]);
          return;
        }
        setStream({ target, progress: 0, total: totalChars(target) });
      }, TYPING_DELAY_MS);
    },
    [input, isGenerating, reduceMotion, aiContext, clearAiContext],
  );

  const stopGenerating = () => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
      setIsTyping(false);
      return;
    }
    if (stream) {
      const partial = sliceMessage(stream.target, stream.progress);
      setMessages((prev) => [...prev, partial]);
      setStream(null);
    }
  };

  // Finish a voice recording: drop into `transcribing` (Processing state)
  // for a short, non-interactive beat — then dispatch the transcribed text
  // through the normal send pipeline. Real speech-to-text would replace the
  // placeholder transcript with whatever the recogniser produced.
  const sendRecording = () => {
    if (!recording) return;
    setRecording(false);
    setRecordingStartedAt(null);
    setTranscribing(true);
    if (transcribeTimerRef.current) clearTimeout(transcribeTimerRef.current);
    transcribeTimerRef.current = setTimeout(() => {
      transcribeTimerRef.current = null;
      setTranscribing(false);
      // If the panel was closed during the transcribe delay, drop the
      // dispatch — otherwise a phantom user message would appear the next
      // time the panel is opened. Mirrors the guard in the typing callback.
      if (!openRef.current) return;
      sendMessage(VOICE_TRANSCRIPT_PLACEHOLDER);
    }, TRANSCRIBE_DELAY_MS);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleCopy = (msg: Message) => {
    const text =
      msg.kind === 'text' ? msg.content : richToPlainText(msg.content);
    try {
      void navigator.clipboard?.writeText(text);
    } catch {
      /* clipboard unavailable — silently no-op. */
    }
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    setCopiedId(msg.id);
    copyTimerRef.current = setTimeout(() => {
      copyTimerRef.current = null;
      setCopiedId((id) => (id === msg.id ? null : id));
    }, COPY_CONFIRM_MS);
  };

  /* ── Per-message feedback ─────────────────────────────────────
   * ThumbsUp is a one-shot acknowledgement: clicking flips the thumb to
   * active, fires a confirmation toast, and is undone by a second click.
   * ThumbsDown opens an inline panel beneath the message actions with
   * categorical chips and an "Other…" path to a free-text view. Both
   * commit paths show the same confirmation toast and leave the thumb
   * in an active state so the user can see their rating stuck. */
  const handleHelpful = (id: string) => {
    // Thumbs-up now opens the same inline panel as thumbs-down (heading +
    // textarea + suggestion chips) rather than committing immediately, so
    // positive feedback can carry an optional comment. Clicking an already-
    // active thumb retracts the rating and closes the panel. The
    // confirmation toast fires on submit, not here.
    const wasUp = feedback[id]?.rating === 'up';
    setFeedback((prev) => {
      const next = { ...prev };
      if (wasUp) {
        delete next[id];
      } else {
        next[id] = { rating: 'up', panelOpen: true };
      }
      return next;
    });
  };
  const handleNotHelpful = (id: string) => {
    // Mirror of `handleHelpful`: open the inline panel, or retract if the
    // thumb is already active.
    const wasDown = feedback[id]?.rating === 'down';
    setFeedback((prev) => {
      const next = { ...prev };
      if (wasDown) {
        delete next[id];
      } else {
        next[id] = { rating: 'down', panelOpen: true };
      }
      return next;
    });
  };
  const handleFeedbackSubmit = (id: string) => {
    // Commit: close the panel but keep the rating so the thumb stays active
    // and the user can see their feedback was recorded. The free-text payload
    // is ephemeral in this POC, so we only need to persist the rating.
    setFeedback((prev) => {
      const existing = prev[id];
      if (!existing) return prev;
      return { ...prev, [id]: { rating: existing.rating } };
    });
    setToastMessage(FEEDBACK_TOAST_MSG);
  };
  const handleFeedbackDismiss = (id: string) => {
    // X on the panel header — drops the rating entirely (no toast).
    setFeedback((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleBodyScroll = () => {
    const el = bodyRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.clientHeight - el.scrollTop;
    const nearBottom = dist < SCROLL_FAB_THRESHOLD;
    // Record the user's intent: scrolling up unpins the follow, scrolling
    // back down re-pins it. The auto-scroll effect reads this on the next
    // content growth.
    stickToBottomRef.current = nearBottom;
    setShowScrollDown(!nearBottom);
  };

  const scrollToBottom = () => {
    const el = bodyRef.current;
    if (!el) return;
    // Clicking the FAB re-pins the follow so subsequent growth keeps tracking.
    stickToBottomRef.current = true;
    setShowScrollDown(false);
    el.scrollTo({
      top: el.scrollHeight,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  // The empty-state surface (heading + suggestions) shows whenever the
  // transcript is empty and no reply is in-flight. Once the first user
  // message lands, suggestions never come back for this conversation.
  const showEmptyState =
    messages.length === 0 && !isGenerating && !stream;
  const hasContext = aiContext.length > 0;
  const suggestionList = hasContext ? CONTEXT_PROMPTS : SUGGESTED_PROMPTS;

  // Match on `kind + id` rather than `id` alone. AiContextItem ids are only
  // unique within a kind (a user and a device may share a UUID), so removing
  // by id alone could drop the wrong chip. The functional updater guards
  // against stale snapshots if multiple removes land in the same tick.
  const removeContext = (kind: AiContextItem['kind'], id: string) => {
    setAiContext((prev) => prev.filter((c) => !(c.kind === kind && c.id === id)));
  };

  // Drop the current conversation back to the empty state. Shared by the
  // header “New conversation” button and the vertical-switch effect above
  // so both paths leave the panel in an identical zeroed state — no stray
  // typing/transcribe timers, no half-formed stream, no leftover input.
  // The outgoing transcript is already persisted by the auto-save effect
  // below; resetting just detaches the panel from that history entry.
  const resetConversation = useCallback(() => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    if (transcribeTimerRef.current) {
      clearTimeout(transcribeTimerRef.current);
      transcribeTimerRef.current = null;
    }
    // The copy-confirmation tick fires ~1.5s after a click; without this
    // a "New conversation" (or delete-of-active) pressed inside that
    // window would leave a pending timer that flips `copiedId` back on
    // in the freshly-emptied chat.
    if (copyTimerRef.current) {
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = null;
    }
    setMessages([]);
    setStream(null);
    setIsTyping(false);
    setInput('');
    setRecording(false);
    setRecordingStartedAt(null);
    setTranscribing(false);
    setCopiedId(null);
    // Per-message thumbs/inline-panel state is ephemeral and tied to the
    // current transcript — drop it alongside the transcript itself.
    setFeedback({});
    setToastMessage(null);
    replyIdxRef.current = 0;
    idCounterRef.current = 0;
    activeConvIdRef.current = null;
    activeConvCreatedAtRef.current = null;
  }, []);

  // Persist the conversation whenever messages change. `messages` only
  // mutates on user send and stream-finalisation (~2 writes per turn),
  // so a debounce isn't needed. Skips empty transcripts and the one-shot
  // replace triggered by loading an existing conversation.
  useEffect(() => {
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    if (messages.length === 0) return;
    const firstUser = messages.find((m) => m.role === 'user');
    if (!firstUser) return;
    const now = Date.now();
    if (!activeConvIdRef.current) {
      activeConvIdRef.current = newConversationId();
      activeConvCreatedAtRef.current = now;
    }
    const conv: ChatConversation = {
      id: activeConvIdRef.current,
      verticalId: vertical.id,
      title: deriveConversationTitle(firstUser),
      createdAt: activeConvCreatedAtRef.current ?? now,
      updatedAt: now,
      messages,
    };
    saveConversation(vertical.id, conv);
    setConversations(listConversations(vertical.id));
  }, [messages, vertical.id]);

  const loadConversation = useCallback((conv: ChatConversation) => {
    // Cancel anything in flight before swapping transcripts so a
    // pending typing-timer doesn't append a reply to the loaded chat.
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    if (transcribeTimerRef.current) {
      clearTimeout(transcribeTimerRef.current);
      transcribeTimerRef.current = null;
    }
    // Same logic for the copy-confirmation tick: a copy on the outgoing
    // transcript followed by an immediate history pick would otherwise
    // leave a pending timer that flips "Copied" on a message in the
    // newly-loaded conversation that happens to share its id.
    if (copyTimerRef.current) {
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = null;
    }
    setStream(null);
    setIsTyping(false);
    setInput('');
    setRecording(false);
    setRecordingStartedAt(null);
    setTranscribing(false);
    setCopiedId(null);
    // Feedback isn't persisted with history, so loading another
    // transcript should always start with a clean slate.
    setFeedback({});
    setToastMessage(null);
    activeConvIdRef.current = conv.id;
    activeConvCreatedAtRef.current = conv.createdAt;
    // Resume the id counter past the loaded messages' max id so any
    // newly-appended messages don't clash with persisted ones in React's
    // key space (existing ids are `m-<n>`).
    idCounterRef.current = conv.messages.reduce((max, m) => {
      const match = /^m-(\d+)$/.exec(m.id);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);
    skipNextSaveRef.current = true;
    setMessages(conv.messages);
    setView('chat');
  }, []);

  const handleDeleteConversation = useCallback(
    (id: string) => {
      const wasActive = activeConvIdRef.current === id;
      deleteConversation(vertical.id, id);
      setConversations(listConversations(vertical.id));
      // If the user just deleted the conversation that's currently open,
      // also clear the on-screen transcript. Without this, the deleted
      // messages stay rendered in the chat view and the next user send
      // would auto-save them back to storage under a brand-new id —
      // effectively undoing the delete. `resetConversation` clears the
      // messages, the active refs, and any in-flight timers in one go.
      if (wasActive) {
        resetConversation();
      }
    },
    [vertical.id, resetConversation],
  );

  const startNewConversation = useCallback(() => {
    resetConversation();
    setView('chat');
  }, [resetConversation]);

  if (!open) return null;

  return (
    <aside
      className={cx(styles.panel, panelDragging && styles.panelDragging, className)}
      style={panelStyle}
      role="complementary"
      aria-label={aiTitle}
    >
      {panelDragging ? (
        <button
          type="button"
          aria-label="Drag to resize"
          className={cx(styles.resizeHandle, styles.resizeHandleDragging)}
          onPointerDown={handleResizePointerDown}
          onClick={(e) => e.preventDefault()}
        >
          <span className={styles.resizeHandleGrip} aria-hidden="true" />
        </button>
      ) : (
        <Tooltip label="Drag to resize" placement="bottom" delay={150} followCursor>
          <button
            type="button"
            aria-label="Drag to resize"
            className={styles.resizeHandle}
            onPointerDown={handleResizePointerDown}
            onClick={(e) => e.preventDefault()}
          >
            <span className={styles.resizeHandleGrip} aria-hidden="true" />
          </button>
        </Tooltip>
      )}

      <div className={styles.panelSurface}>

      {/* ── Header (Figma `AI_Panel_Header`) ──
          Back arrow (chat view only) opens the history list; picking a row
          or pressing Plus returns to chat. Title reflects the active view:
          “Chat history” on the list, the first user message on an active
          conversation, or “New conversation” at idle. Plus starts a fresh
          chat and forces a return to the chat view. X closes the whole
          panel. */}
      <header className={styles.header}>
        {view === 'chat' && (
          <Tooltip label="All chats">
            <IconButton
              icon="Chats"
              ariaLabel="Show chat history"
              size="s"
              onClick={() => setView('history')}
            />
          </Tooltip>
        )}
        <h2 className={styles.title}>
          {view === 'history'
            ? 'Chat history'
            : deriveConversationTitleFromMessages(messages) ?? 'New conversation'}
        </h2>
        <div className={styles.headerActions}>
          <Tooltip label="New chat">
            <IconButton
              icon="Plus"
              ariaLabel="New conversation"
              size="s"
              onClick={startNewConversation}
            />
          </Tooltip>
          <Tooltip label="Close">
            <IconButton
              icon="X"
              ariaLabel="Close AI panel"
              size="s"
              onClick={onClose}
            />
          </Tooltip>
        </div>
      </header>

      {view === 'history' ? (
        <HistoryList
          conversations={conversations}
          activeId={activeConvIdRef.current}
          onPick={loadConversation}
          onDelete={handleDeleteConversation}
        />
      ) : (
        <>
          {/* ── Conversation (scrollable) ── */}
          {/* In the empty state, anchor children to the bottom of the body so
              the heading + chips group hugs the composer (Figma `Content` node
              uses `justify-end`). The class toggles off as soon as messages
              land, restoring the default top-down chat flow. */}
          <div
            className={cx(styles.body, showEmptyState && styles.bodyEmpty)}
            ref={bodyRef}
            onScroll={handleBodyScroll}
          >
            {messages.map((m) =>
              m.role === 'user' ? (
                <UserMessage key={m.id} attachments={m.kind === 'text' ? m.attachments : undefined}>
                  {m.kind === 'text' ? m.content : ''}
                </UserMessage>
              ) : (
                <AssistantMessage
                  key={m.id}
                  message={m}
                  copied={copiedId === m.id}
                  onCopy={() => handleCopy(m)}
                  feedback={feedback[m.id]}
                  onHelpful={() => handleHelpful(m.id)}
                  onNotHelpful={() => handleNotHelpful(m.id)}
                  onFeedbackSubmit={() => handleFeedbackSubmit(m.id)}
                  onFeedbackDismiss={() => handleFeedbackDismiss(m.id)}
                />
              ),
            )}
            {stream && (
              <AssistantMessage
                key={`stream-${stream.target.id}`}
                message={sliceMessage(stream.target, stream.progress)}
                streaming
              />
            )}
            {isTyping && <TypingIndicator />}
            {showEmptyState && (
              <EmptyState
                aiTitle={aiTitle}
                prompts={suggestionList}
                onPick={(text) => sendMessage(text)}
              />
            )}
          </div>

          {/* ── Scroll-to-bottom FAB ── */}
          <button
            type="button"
            className={cx(styles.scrollDown, showScrollDown && styles.scrollDownVisible)}
            onClick={scrollToBottom}
            aria-label="Scroll to latest"
            aria-hidden={showScrollDown ? undefined : 'true'}
            tabIndex={showScrollDown ? 0 : -1}
          >
            <Icon name="ArrowDown" size="16px" />
          </button>

          {/* ── Composer ── */}
          <Composer
            value={input}
            onChange={setInput}
            onKeyDown={handleKeyDown}
            onSend={() => sendMessage()}
            onStop={stopGenerating}
            isGenerating={isGenerating}
            recording={recording}
            transcribing={transcribing}
            recordingElapsedMs={recordingElapsedMs}
            onStartRecording={startRecording}
            onCancelRecording={cancelRecording}
            onSendRecording={sendRecording}
            attachments={aiContext}
            onRemoveAttachment={removeContext}
            onClearAttachments={clearAiContext}
            aiTitle={aiTitle}
          />
        </>
      )}
      </div>
      {/* Toast is rendered via portal so it floats above the panel chrome
          regardless of the current view. Owner-cleared via `onDismiss`. */}
      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
    </aside>
  );
}

/* ----------------------------------------------------------------
 * Tuning
 * ---------------------------------------------------------------- */

/** "Thinking" delay before streaming begins. Held long enough for the
 *  shimmering "Thinking…" indicator to play a fuller sweep (shimmer cycle is
 *  ~2s) before the reply starts revealing. */
const TYPING_DELAY_MS = 1400;
/** Streaming reveal speed — fine-grained pace (~310 chars/sec at 16ms ticks)
 *  so the text emerges smoothly rather than in visible character chunks. */
const STREAM_CHARS_PER_TICK = 5;
const STREAM_TICK_MS = 16;
/** How long the copy-confirmation tick is shown. */
const COPY_CONFIRM_MS = 1500;
/** Show scroll-to-bottom button once user is this far from the tail. */
const SCROLL_FAB_THRESHOLD = 120;
/** Time spent in the non-interactive Processing state after a voice
 *  recording is sent, before the transcript is dispatched. */
const TRANSCRIBE_DELAY_MS = 900;
/** Placeholder text dispatched after a simulated voice transcription. Real
 *  speech-to-text would replace this with the recogniser's output. */
const VOICE_TRANSCRIPT_PLACEHOLDER =
  'Walk me through what I can do in this workspace.';

/** Confirmation toast copy shown when feedback is submitted (thumbs-up or
 *  thumbs-down). Kept single-source so any reword applies everywhere.
 *  Matches the Figma `Toast` reference copy. */
const FEEDBACK_TOAST_MSG = 'Thank you for your feedback!';

/** Suggestion chips shown beneath the feedback textarea. Clicking a chip
 *  fills the textarea with its text (and focuses it) so the user can keep
 *  typing to customise the suggestion, rather than committing immediately. */
const POSITIVE_FEEDBACK_CHIPS = [
  'Answered my question',
  'Solution was fast',
  'Right level of detail',
  'Easy to understand',
] as const;

const NEGATIVE_FEEDBACK_CHIPS = [
  'I need more detailed information about…',
  'The response was not relevant, for example…',
  'The response contradicts, for example…',
  'The response was incorrect, for example…',
] as const;

interface StreamState {
  /** The fully-formed reply we're typing out. */
  target: Message;
  /** Visible character count so far. */
  progress: number;
  /** Total character count of the target. */
  total: number;
}

/* ============================================================
 *                       Subcomponents
 * ============================================================ */

interface UserMessageProps {
  children: ReactNode;
  attachments?: AiContextItem[];
}

function UserMessage({ children, attachments }: UserMessageProps) {
  return (
    <div className={cx(styles.userRow, styles.appear)}>
      <div className={styles.userColumn}>
        {attachments && attachments.length > 0 && (
          <div className={styles.attachmentRow} aria-label="Attachments">
            {attachments.map((a) => (
              <span key={`${a.kind}-${a.id}`} className={styles.attachmentChip}>
                <Icon name={iconForKind(a.kind)} size="12px" />
                <span className={styles.attachmentChipLabel}>{a.label}</span>
              </span>
            ))}
          </div>
        )}
        <div className={styles.userBubble}>{children}</div>
      </div>
    </div>
  );
}

interface AssistantMessageProps {
  message: Message;
  /** True while this message is the actively-streaming target. */
  streaming?: boolean;
  /** Copy-confirmation tick state for this message. */
  copied?: boolean;
  onCopy?: () => void;
  /** Per-message feedback state. When absent, both thumbs are inactive and
   *  no inline panel is shown. */
  feedback?: FeedbackEntry;
  onHelpful?: () => void;
  onNotHelpful?: () => void;
  onFeedbackSubmit?: (text: string) => void;
  onFeedbackDismiss?: () => void;
}

/**
 * PulseAvatar — the circular assistant avatar wrapped in a breathing
 * BorderBeam. The pulse plays on mount, then fades out after a few seconds
 * (via BorderBeam's `active` toggle) so it draws attention on appearance
 * without animating indefinitely.
 */
function PulseAvatar() {
  const [active, setActive] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setActive(false), 3000);
    return () => clearTimeout(t);
  }, []);
  return (
    <BorderBeam size="pulse-outside" colorVariant="colorful" active={active}>
      <span className={styles.avatar} aria-hidden="true">
        <Icon name="Sparkle" size="14px" />
      </span>
    </BorderBeam>
  );
}

function AssistantMessage({
  message,
  streaming,
  copied,
  onCopy,
  feedback,
  onHelpful,
  onNotHelpful,
  onFeedbackSubmit,
  onFeedbackDismiss,
}: AssistantMessageProps) {
  const thumbUpActive = feedback?.rating === 'up';
  const thumbDownActive = feedback?.rating === 'down';
  const panelOpen = !!feedback?.panelOpen;
  return (
    <div className={cx(styles.assistantRow, styles.appear)}>
      <PulseAvatar />
      <div className={styles.assistant}>
        <div className={styles.assistantBody}>
          {message.kind === 'rich' ? (
            renderRich(message.content, !!streaming)
          ) : (
            <p>
              {streaming ? <StreamingText text={message.content} /> : message.content}
              {streaming && <StreamCursor />}
            </p>
          )}
        </div>
        {!streaming && onCopy && (
          <div className={styles.messageActions}>
            {/* Tooltip label mirrors the active aria-label so visual and AT
                descriptions stay in sync across the copy ↔ copied flip. */}
            <Tooltip label={copied ? 'Copied' : 'Copy reply'}>
              <IconButton
                icon={<CopyCheckSwap copied={copied} />}
                ariaLabel={copied ? 'Copied' : 'Copy reply'}
                size="s"
                onClick={onCopy}
              />
            </Tooltip>
            <Tooltip label="Helpful">
              <IconButton
                icon="ThumbsUp"
                ariaLabel="Helpful"
                size="s"
                aria-pressed={thumbUpActive}
                className={thumbUpActive ? styles.thumbActive : undefined}
                onClick={onHelpful}
              />
            </Tooltip>
            <Tooltip label="Not helpful">
              <IconButton
                icon="ThumbsDown"
                ariaLabel="Not helpful"
                size="s"
                aria-pressed={thumbDownActive}
                className={thumbDownActive ? styles.thumbActive : undefined}
                onClick={onNotHelpful}
              />
            </Tooltip>
            {copied && (
              <span className={styles.srOnly} aria-live="polite">
                Copied to clipboard
              </span>
            )}
          </div>
        )}
        {panelOpen && feedback && (
          <AccordionReveal>
            {/* Key on the rating so switching thumbs (up ↔ down) without
                dismissing first remounts the panel and resets its local draft,
                rather than carrying stale text into the other rating's context. */}
            <FeedbackPanel
              key={feedback.rating}
              rating={feedback.rating}
              onSubmit={(text) => onFeedbackSubmit?.(text)}
              onDismiss={() => onFeedbackDismiss?.()}
            />
          </AccordionReveal>
        )}
      </div>
    </div>
  );
}

/** Inline feedback panel rendered beneath the assistant message actions,
 *  shared by both thumbs-up and thumbs-down. Shows a heading, a free-text
 *  textarea, and suggestion chips. Clicking a chip fills the textarea with
 *  its example text and focuses it (cursor at end) so the user can keep
 *  typing to customise the feedback.
 *
 *  Thumbs-down requires a non-empty comment before it can be submitted so we
 *  never capture an "empty" not-helpful with no reason; thumbs-up text is
 *  optional. Controlled locally, so dismiss drops the draft. Forwards a ref
 *  to the root so the parent can scroll it into view on open. */
function FeedbackPanel({
  ref,
  rating,
  onSubmit,
  onDismiss,
}: {
  ref?: Ref<HTMLDivElement>;
  rating: 'up' | 'down';
  onSubmit: (text: string) => void;
  onDismiss: () => void;
}) {
  const [draft, setDraft] = useState('');
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const headingId = useId();
  const chips = rating === 'up' ? POSITIVE_FEEDBACK_CHIPS : NEGATIVE_FEEDBACK_CHIPS;
  const heading = rating === 'up' ? 'What worked well?' : 'What could be better?';
  // Thumbs-down must carry a reason — require non-empty text before submit so
  // we never record an empty "not helpful". Thumbs-up comments are optional.
  const requireText = rating === 'down';
  const canSubmit = !requireText || draft.trim().length > 0;
  // Promote the send button to the primary brand-blue treatment as soon as
  // the textarea holds any content, signalling it as the primary action.
  const hasText = draft.trim().length > 0;

  const fillFromChip = (text: string) => {
    setDraft(text);
    // The textarea is controlled, so its value updates on the next paint.
    // Focus it and drop the caret at the end once that value lands so the
    // user can continue typing to customise the suggestion.
    requestAnimationFrame(() => {
      const el = taRef.current;
      if (!el) return;
      el.focus();
      const end = el.value.length;
      el.setSelectionRange(end, end);
    });
  };

  return (
    <div ref={ref} className={styles.feedbackPanel} role="group" aria-label="Feedback">
      <div className={styles.feedbackHeader}>
        <span id={headingId} className={styles.feedbackPrompt}>{heading}</span>
        <Tooltip label="Dismiss">
          <IconButton
            icon="X"
            ariaLabel="Dismiss feedback"
            size="s"
            onClick={onDismiss}
          />
        </Tooltip>
      </div>
      <div className={styles.feedbackTextWrap}>
        <textarea
          ref={taRef}
          className={styles.feedbackTextarea}
          placeholder="Give us feedback…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          autoFocus
          // Placeholders aren't reliable labels for assistive tech, so name
          // the field from the panel heading and flag the thumbs-down path as
          // required (it can't be submitted without a reason).
          aria-labelledby={headingId}
          aria-required={requireText || undefined}
        />
        <div className={styles.feedbackSend}>
          <Tooltip label="Submit feedback">
            <IconButton
              icon="ArrowUp"
              ariaLabel="Submit feedback"
              size="s"
              variant="secondary"
              className={hasText ? styles.feedbackSendActive : undefined}
              disabled={!canSubmit}
              onClick={() => canSubmit && onSubmit(draft.trim())}
            />
          </Tooltip>
        </div>
      </div>
      <div className={styles.feedbackChips} role="group" aria-label="Suggestions">
        {chips.map((label) => (
          <button
            key={label}
            type="button"
            className={styles.feedbackChip}
            onClick={() => fillFromChip(label)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Render a `rich` message's blocks: paragraphs, ordered lists, code blocks,
 *  tables, and source-link pills. When `streaming`, a blinking cursor is
 *  appended after the last text/list block. Code / table / sources are atomic
 *  — they reveal wholesale once the stream reaches them (see `sliceMessage`),
 *  so they never carry a cursor. */
function renderRich(blocks: RichBlock[], streaming: boolean): ReactNode {
  return blocks.map((b, i) => {
    const isLast = i === blocks.length - 1;
    if (b.type === 'p') {
      const streamingHere = streaming && isLast;
      return (
        <p key={i}>
          {streamingHere ? <StreamingText text={b.text} /> : b.text}
          {streamingHere && <StreamCursor />}
        </p>
      );
    }
    if (b.type === 'ol') {
      return (
        <ol key={i} className={styles.list}>
          {b.items.map((it, j) => {
            const isLastItem = isLast && j === b.items.length - 1;
            return (
              <li key={j}>
                {streaming && isLastItem ? <StreamingText text={it} /> : it}
                {streaming && isLastItem && <StreamCursor />}
              </li>
            );
          })}
        </ol>
      );
    }
    if (b.type === 'code') {
      return <CodeBlock key={i} code={b.code} language={b.language} />;
    }
    if (b.type === 'table') {
      return <TableBlock key={i} columns={b.columns} rows={b.rows} />;
    }
    if (b.type === 'sources') {
      return <SourcesBlock key={i} links={b.links} />;
    }
    return null;
  });
}

/** Fenced code block with a copy-to-clipboard affordance pinned to the
 *  top-right. Mirrors the message-level copy pattern (icon cross-fade + polite
 *  live region) but owns its own local confirmation state. */
function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );
  const onCopy = () => {
    try {
      void navigator.clipboard?.writeText(code);
    } catch {
      /* clipboard unavailable — silently no-op. */
    }
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), COPY_CONFIRM_MS);
  };
  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeCopy}>
        <Tooltip label={copied ? 'Copied' : 'Copy code'}>
          <IconButton
            icon={<CopyCheckSwap copied={copied} />}
            ariaLabel={copied ? 'Copied' : 'Copy code'}
            size="s"
            onClick={onCopy}
          />
        </Tooltip>
      </div>
      <pre className={styles.codePre}>
        <code data-language={language}>{code}</code>
      </pre>
      {copied && (
        <span className={styles.srOnly} aria-live="polite">
          Copied to clipboard
        </span>
      )}
    </div>
  );
}

/** Compact table preview (two or more columns). */
function TableBlock({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={i} scope="col" className={styles.tableHeadCell}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (
                <td key={j} className={styles.tableCell}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** "Sources:" label followed by reference links rendered as pills, each with a
 *  trailing external-link glyph. A pill with a real `href` opens in a new tab;
 *  otherwise it renders as a non-navigating chip (placeholder data). */
function SourcesBlock({ links }: { links: SourceLink[] }) {
  return (
    <div className={styles.sourcesRow}>
      <span className={styles.sourcesLabel}>Sources:</span>
      <div className={styles.sourcesPills}>
        {links.map((l, i) =>
          l.href ? (
            <a
              key={i}
              className={styles.sourcePill}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.sourcePillLabel}>{l.label}</span>
              <Icon name="ArrowSquareOut" size="14px" />
            </a>
          ) : (
            <span key={i} className={styles.sourcePill} role="link" aria-label={l.label}>
              <span className={styles.sourcePillLabel}>{l.label}</span>
              <Icon name="ArrowSquareOut" size="14px" />
            </span>
          ),
        )}
      </div>
    </div>
  );
}

function StreamCursor() {
  return <span className={styles.streamCursor} aria-hidden="true" />;
}

/** Renders streamed text with the trailing (still-typing) word softened, so
 *  freshly-revealed glyphs ease in at the streaming edge instead of snapping
 *  in character-by-character. The soft word resolves to full weight as soon
 *  as the stream moves past it. */
function StreamingText({ text }: { text: string }) {
  const sp = text.lastIndexOf(' ');
  if (sp < 0) {
    return <span className={styles.streamFresh}>{text}</span>;
  }
  return (
    <>
      {text.slice(0, sp)}
      <span className={styles.streamFresh}>{text.slice(sp)}</span>
    </>
  );
}

/** Copy → Check icon swap: two icons stacked in one slot that cross-fade with
 *  a blur + scale when `copied` flips, matching the transitions.dev icon-swap. */
function CopyCheckSwap({ copied }: { copied: boolean }) {
  return (
    <span
      className={styles.iconSwap}
      data-copied={copied ? 'true' : 'false'}
      aria-hidden="true"
    >
      <span className={cx(styles.iconSwapLayer, styles.iconSwapCopy)}>
        <Icon name="Copy" size="16px" />
      </span>
      <span className={cx(styles.iconSwapLayer, styles.iconSwapCheck)}>
        <Icon name="Check" size="16px" />
      </span>
    </span>
  );
}

/** Grows its children in from zero height (grid-rows 0fr → 1fr) on mount, so
 *  the inline feedback panel expands like an accordion instead of popping.
 *  Once the expand transition finishes it scrolls itself into view (the panel
 *  often sits below the AI body's scroll window on long replies). */
function AccordionReveal({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const innerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      // No transition to wait on — reveal immediately, then expose it.
      setOpen(true);
      const raf = requestAnimationFrame(() =>
        innerRef.current?.scrollIntoView({ block: 'nearest', behavior: 'auto' }),
      );
      return () => cancelAnimationFrame(raf);
    }
    // Double rAF: the collapsed (0fr) state must paint before we flip to 1fr,
    // otherwise the browser coalesces both and the grid-rows transition is
    // skipped (the panel snaps open instead of growing).
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setOpen(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  // Scroll into view only once the height animation has actually finished, so
  // we target the panel at its final size rather than while it is still 0-tall.
  const handleTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && e.propertyName === 'grid-template-rows') {
      innerRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  };

  return (
    <div
      className={cx(styles.accReveal, open && styles.accRevealOpen)}
      onTransitionEnd={handleTransitionEnd}
    >
      <div ref={innerRef} className={styles.accRevealInner}>
        {children}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div
      className={cx(styles.assistantRow, styles.appear)}
      aria-live="polite"
      aria-label="Assistant is typing"
    >
      <PulseAvatar />
      <span className={styles.thinking} data-text="Thinking…" aria-hidden="true">
        Thinking…
      </span>
    </div>
  );
}

interface EmptyStateProps {
  aiTitle: string;
  prompts: SuggestedPrompt[];
  onPick: (text: string) => void;
}

/** Empty-state surface shown when there are no messages yet. Matches
 *  Figma node `6669:261` — a centred H4 heading sitting above the
 *  stacked suggestion chips. The parent body uses `.bodyEmpty` to anchor
 *  this surface to the composer (`justify-end`). */
function EmptyState({ aiTitle, prompts, onPick }: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <h3 className={cx(styles.emptyHeading, styles.revealItem)}>
        Meet {aiTitle}, <br />your personal AI assistant
      </h3>
      <div
        className={styles.suggestions}
        role="group"
        aria-label="Suggested prompts"
      >
        {prompts.map((p, i) => (
          <button
            key={p.label}
            type="button"
            className={cx(styles.suggestionChip, styles.revealItem)}
            style={{ '--reveal-delay': `${(i + 1) * 40}ms` } as CSSProperties}
            onClick={() => onPick(p.prompt)}
          >
            <Icon name={p.icon} size="20px" className={styles.suggestionChipIcon} />
            <span className={styles.suggestionChipLabel}>{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

interface HistoryListProps {
  conversations: ChatConversation[];
  /** The id of the conversation currently loaded in chat view, if any.
   *  Used to highlight the matching row when the user opens history. */
  activeId: string | null;
  onPick: (conv: ChatConversation) => void;
  onDelete: (id: string) => void;
}

/** Saved-conversation browser. Replaces the body + composer when
 *  `view === 'history'`. Rows are ordered newest-first (the store sorts
 *  on write) and reveal a delete affordance on hover / keyboard focus. */
function HistoryList({ conversations, activeId, onPick, onDelete }: HistoryListProps) {
  const [query, setQuery] = useState('');

  // Filter + group are pure projections of `conversations` + `query`. Memo
  // keeps the work off the render hot path when the parent re-renders for
  // unrelated reasons (e.g. a save that doesn't change the visible list).
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, query]);
  const groups = useMemo(() => groupByBucket(filtered), [filtered]);

  // Zero conversations ever — show the full empty state, no search input
  // (nothing to search through).
  if (conversations.length === 0) {
    return (
      <div className={styles.historyEmpty}>
        <p className={styles.historyEmptyTitle}>No chat history yet</p>
        <p className={styles.historyEmptyHint}>
          Conversations you start will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.historyWrap}>
      <div className={styles.historyControls}>
        <TextInput
          iconLead="MagnifyingGlass"
          size="default"
          placeholder="Search conversations"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search conversations"
        />
      </div>
      <div className={styles.historyScroll}>
        {filtered.length === 0 ? (
          <p className={styles.historyNoMatch}>No conversations match your search.</p>
        ) : (
          groups.map(([bucket, items]) => {
            const labelId = `ai-history-group-${bucket}`;
            return (
              <section
                key={bucket}
                className={styles.historyGroup}
                aria-labelledby={labelId}
              >
                <h3 id={labelId} className={styles.historyGroupLabel}>
                  {HISTORY_BUCKET_LABELS[bucket]}
                </h3>
                <ul className={styles.historyList} role="list">
                  {items.map((c) => (
                    <li
                      key={c.id}
                      className={cx(styles.historyItem, c.id === activeId && styles.historyItemActive)}
                    >
                      <button
                        type="button"
                        className={styles.historyItemMain}
                        onClick={() => onPick(c)}
                      >
                        <span className={styles.historyItemTitle}>{c.title}</span>
                        <span className={styles.historyItemTime}>{formatRowTime(c.updatedAt, bucket)}</span>
                      </button>
                      <IconButton
                        icon="Trash"
                        ariaLabel={`Delete conversation: ${c.title}`}
                        size="s"
                        className={styles.historyItemDelete}
                        onClick={() => onDelete(c.id)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}

interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onStop: () => void;
  isGenerating: boolean;
  /** True while the mic is open and the user is recording a voice prompt. */
  recording: boolean;
  /** True for the brief, non-interactive window between "stop recording"
   *  and the transcribed message being sent. */
  transcribing: boolean;
  /** Wall-clock duration of the current recording, in ms. */
  recordingElapsedMs: number;
  onStartRecording: () => void;
  onCancelRecording: () => void;
  onSendRecording: () => void;
  attachments: AiContextItem[];
  onRemoveAttachment: (kind: AiContextItem['kind'], id: string) => void;
  onClearAttachments: () => void;
  aiTitle: string;
}

/** Max number of lines of attachment chips to preview in the composer before
 *  collapsing the remainder into a single "+ N more" pill. */
const CHIP_MAX_LINES = 2;

interface ComposerAttachmentsProps {
  attachments: AiContextItem[];
  onRemoveAttachment: (kind: AiContextItem['kind'], id: string) => void;
  onClearAttachments: () => void;
}

/**
 * ComposerAttachments — pending-attachment chips shown above the composer
 * input. Clamps the preview to `CHIP_MAX_LINES` lines; any chips that would
 * overflow are replaced by a trailing "+ N more" pill.
 *
 * Chip widths vary with their labels, so an off-screen copy of the full chip
 * set is laid out to measure how many fit: line 1 is kept in full, then line 2
 * is greedily filled while reserving room for the "+ N more" pill and the
 * trailing Clear button. Measuring in a layout effect (before paint) avoids a
 * visible reflow, and a ResizeObserver keeps the count correct as the panel
 * resizes.
 */
function ComposerAttachments({
  attachments,
  onRemoveAttachment,
  onClearAttachments,
}: ComposerAttachmentsProps) {
  const measureRef = useRef<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(attachments.length);

  // Chip width depends on the label as well as identity, so a label change
  // (even with the same kind+id) must re-run the measurement below. Stringify
  // the full tuple — not just kind+id — into the effect key.
  const attachmentsKey = attachments
    .map((a) => `${a.kind}:${a.id}:${a.label}`)
    .join('|');

  useLayoutEffect(() => {
    const wrap = measureRef.current;
    if (!wrap) return undefined;

    const compute = () => {
      const chipEls = Array.from(
        wrap.querySelectorAll<HTMLElement>('[data-ghost-chip]'),
      );
      const n = chipEls.length;
      if (n === 0) {
        setVisibleCount(0);
        return;
      }

      const tops = chipEls.map((el) => el.offsetTop);
      const firstTop = tops[0];
      const secondTop = tops.find((t) => t > firstTop);
      // Everything on one line → all fit.
      if (secondTop === undefined) {
        setVisibleCount(n);
        return;
      }
      const thirdTop = tops.find((t) => t > secondTop);
      // Fits within the line budget → show all, no counter.
      if (CHIP_MAX_LINES >= 2 && thirdTop === undefined) {
        setVisibleCount(n);
        return;
      }

      // Genuine overflow: keep line 1 in full, then greedily fill line 2 while
      // reserving room for the "+ N more" pill and the trailing Clear button.
      const containerWidth = wrap.clientWidth;
      const gap = parseFloat(getComputedStyle(wrap).columnGap) || 4;
      const moreEl = wrap.querySelector<HTMLElement>('[data-ghost-more]');
      const clearEl = wrap.querySelector<HTMLElement>('[data-ghost-clear]');
      // Space the "+ N more" pill and Clear button occupy on line 2, including
      // the single gap between them. The gap *before* this tail (between the
      // last visible chip and the pill) is supplied by the loop's `+ gap`.
      const reserved =
        (moreEl?.offsetWidth ?? 0) + gap + (clearEl?.offsetWidth ?? 0);

      const line1Count = tops.filter((t) => t === firstTop).length;
      const line2Els = chipEls.filter((_, i) => tops[i] === secondTop);

      let used = 0;
      let kLine2 = 0;
      for (let i = 0; i < line2Els.length; i++) {
        const w = line2Els[i].offsetWidth + (i > 0 ? gap : 0);
        if (used + w + gap + reserved <= containerWidth) {
          used += w;
          kLine2 += 1;
        } else {
          break;
        }
      }
      setVisibleCount(line1Count + kLine2);
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [attachmentsKey]);

  const safeVisible = Math.min(visibleCount, attachments.length);
  const visible = attachments.slice(0, safeVisible);
  const overflow = attachments.length - safeVisible;

  return (
    <div className={styles.composerAttachmentsWrap}>
      <div
        className={styles.composerAttachments}
        role="group"
        aria-label={`${attachments.length} attached`}
      >
        {visible.map((a) => (
          <span key={`${a.kind}-${a.id}`} className={styles.composerChip}>
            <button
              type="button"
              className={styles.composerChipRemove}
              aria-label={`Remove ${a.label}`}
              onClick={() => onRemoveAttachment(a.kind, a.id)}
            >
              <Icon name="X" size="12px" />
            </button>
            <span className={styles.composerChipLabel}>{a.label}</span>
          </span>
        ))}
        {overflow > 0 && (
          <span className={styles.composerChipMore}>+ {overflow} more</span>
        )}
        <button
          type="button"
          className={styles.composerChipClear}
          onClick={onClearAttachments}
        >
          Clear
        </button>
      </div>

      {/* Off-screen measurement copy of the full chip set (see above). */}
      <div
        ref={measureRef}
        className={styles.composerAttachmentsMeasure}
        aria-hidden="true"
      >
        {attachments.map((a) => (
          <span
            key={`${a.kind}-${a.id}`}
            data-ghost-chip
            className={styles.composerChip}
          >
            <span className={styles.composerChipRemove}>
              <Icon name="X" size="12px" />
            </span>
            <span className={styles.composerChipLabel}>{a.label}</span>
          </span>
        ))}
        <span data-ghost-more className={styles.composerChipMore}>
          + {attachments.length} more
        </span>
        <span data-ghost-clear className={styles.composerChipClear}>
          Clear
        </span>
      </div>
    </div>
  );
}

function Composer({
  value,
  onChange,
  onKeyDown,
  onSend,
  onStop,
  isGenerating,
  recording,
  transcribing,
  recordingElapsedMs,
  onStartRecording,
  onCancelRecording,
  onSendRecording,
  attachments,
  onRemoveAttachment,
  onClearAttachments,
  aiTitle,
}: ComposerProps) {
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const composerState = deriveComposerState({
    recording,
    transcribing,
    isGenerating,
    hasText: value.trim().length > 0,
  });
  const canSend = composerState === 'typing';
  const hasAttachments = attachments.length > 0;
  // Recording takes precedence over the attachment-aware placeholder so the
  // textarea reflects the live mic state (matches Figma `.AI_TextArea_Input
  // / State=Recording`). Transcription keeps the normal placeholder — the
  // spinner button already communicates the busy state and the window is
  // brief (~900ms).
  const placeholder =
    composerState === 'recording'
      ? 'Listening…'
      : hasAttachments
        ? `Ask about the ${attachments.length} selected ${
            attachments.length === 1 ? 'item' : 'items'
          }…`
        : 'Ask anything…';

  // Grow the textarea with content (up to a max), shrink back when emptied.
  useLayoutEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  // Auto-focus on open. The AiPanel returns `null` while closed, so the
  // Composer (and this effect) re-mount on every open \u2014 a one-shot effect
  // with an empty dep array is enough to land focus on the textarea each
  // time the panel appears. No-ops if recording is somehow already active
  // on mount (disabled <textarea> ignores .focus()).
  useEffect(() => {
    taRef.current?.focus();
  }, []);

  return (
    <div className={styles.composerWrap}>
      <BorderBeam size="pulse-outside" colorVariant="colorful" strength={0.7} style={{ display: 'block' }}>
      <div
        className={cx(
          styles.composer,
          composerState === 'recording' && styles.composerFocusSuppressed,
        )}
      >
        {composerState !== 'recording' && hasAttachments && (
          <ComposerAttachments
            attachments={attachments}
            onRemoveAttachment={onRemoveAttachment}
            onClearAttachments={onClearAttachments}
          />
        )}

        {/* Textarea stays visible during voice capture and transcription so
            the placeholder / existing text shows above the recording timeline
            or processing spinner (per Figma `.AI_TextArea_Input` recording
            variant). It's disabled in both states to match the intended
            non-interactive behaviour — without this, users could still type
            and press Enter during the ~900ms transcribe window and submit
            an unrelated message before the voice transcript dispatches. */}
        <textarea
          ref={taRef}
          className={styles.textarea}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          disabled={composerState === 'recording' || composerState === 'processing'}
          aria-label={`Message ${aiTitle}`}
        />

        {composerState === 'recording' ? (
          <div
            className={cx(styles.composerActions, styles.composerActionsRecording)}
          >
            <RecordingTimeline elapsedMs={recordingElapsedMs} />
            <div className={styles.composerRight}>
              <ComposerButton
                state="cancel"
                ariaLabel="Cancel recording"
                onClick={onCancelRecording}
              />
              <ComposerButton
                state="send-recording"
                ariaLabel="Send recording"
                onClick={onSendRecording}
              />
            </div>
          </div>
        ) : (
          <div className={styles.composerActions}>
            <div className={styles.composerLeft}>
              <Tooltip label="Add files">
                <ComposerButton state="upload" ariaLabel="Add files" />
              </Tooltip>
              <Tooltip label="Online">
                <span
                  className={styles.modeBadge}
                  role="status"
                  aria-label="Service status: online"
                >
                  <span className={styles.modeDot} aria-hidden="true" />
                </span>
              </Tooltip>
            </div>
            <div className={styles.composerRight}>
              {composerState === 'thinking' ? (
                <ComposerButton
                  state="stop"
                  ariaLabel="Stop generating"
                  onClick={onStop}
                />
              ) : composerState === 'processing' ? (
                <ComposerButton state="processing" ariaLabel="Transcribing" />
              ) : composerState === 'typing' ? (
                <ComposerButton
                  state="send"
                  ariaLabel="Send message"
                  onClick={onSend}
                  disabled={!canSend}
                />
              ) : (
                <ComposerButton
                  state="voice"
                  ariaLabel="Start voice input"
                  onClick={onStartRecording}
                />
              )}
            </div>
          </div>
        )}
      </div>
      </BorderBeam>
      {/* Composer disclaimer (Figma `.Input feedback messages` node).
          Always visible \u2014 not gated to empty state \u2014 so the AI-output
          caveat persists during and after the conversation. */}
      <p className={styles.composerFootnote}>
        Responses are generated using AI and may contain mistakes.
      </p>
    </div>
  );
}

/**
 * ComposerButton — the 32px circular action button used in the AI panel
 * composer. Renders one of seven states from the Figma `.AI_CTA` component
 * set; each state encodes its own icon + visual variant.
 *
 *   `voice`           — idle right-side button (empty composer)
 *   `send`            — primary submit (filled brand-blue)
 *   `stop`            — interrupt an in-flight assistant reply (ghost)
 *   `processing`      — non-interactive busy state with a spinning icon
 *   `send-recording`  — confirm a finished voice recording (filled)
 *   `cancel`          — discard a voice recording (ghost)
 *   `upload`          — left-side attachment button (outlined)
 *
 * Hover/active/disabled treatments live on the variant classes in the CSS
 * module. The Figma set also defines an "Upload (Hover)" node, which is
 * rendered here via the `:hover` pseudo on `.cbtnOutlined` rather than as a
 * discrete state.
 */
export type ComposerButtonState =
  | 'voice'
  | 'send'
  | 'stop'
  | 'processing'
  | 'send-recording'
  | 'cancel'
  | 'upload';

interface ComposerButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'aria-label' | 'type' | 'onClick' | 'disabled' | 'className'
  > {
  state: ComposerButtonState;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel: string;
  className?: string;
  /** Forwarded to the underlying <button> so wrappers like `<Tooltip>` can
   *  measure / focus / hover-track the trigger. */
  ref?: Ref<HTMLButtonElement>;
}

interface ComposerButtonSpec {
  variant: 'ghost' | 'outlined' | 'filled' | 'processing';
  icon: string;
  /** Icon size — tuned per state to match Figma proportions. */
  iconSize: string;
}

const COMPOSER_BUTTON_STATES: Record<ComposerButtonState, ComposerButtonSpec> = {
  voice:            { variant: 'ghost',      icon: 'Microphone',  iconSize: '18px' },
  send:             { variant: 'filled',     icon: 'ArrowUp',     iconSize: '18px' },
  stop:             { variant: 'ghost',      icon: 'Stop',        iconSize: '14px' },
  processing:       { variant: 'processing', icon: 'CircleNotch', iconSize: '16px' },
  'send-recording': { variant: 'filled',     icon: 'Check',       iconSize: '18px' },
  cancel:           { variant: 'ghost',      icon: 'X',           iconSize: '16px' },
  upload:           { variant: 'outlined',   icon: 'Plus',        iconSize: '16px' },
};

const VARIANT_CLASS: Record<ComposerButtonSpec['variant'], string> = {
  ghost:      styles.cbtnGhost,
  outlined:   styles.cbtnOutlined,
  filled:     styles.cbtnFilled,
  processing: styles.cbtnProcessing,
};

export function ComposerButton({
  state,
  onClick,
  disabled,
  ariaLabel,
  className,
  ref,
  ...rest
}: ComposerButtonProps) {
  const spec = COMPOSER_BUTTON_STATES[state];
  const isProcessing = state === 'processing';
  return (
    <button
      ref={ref}
      type="button"
      className={cx(styles.cbtn, VARIANT_CLASS[spec.variant], className)}
      onClick={onClick}
      disabled={disabled || isProcessing}
      aria-label={ariaLabel}
      aria-busy={isProcessing || undefined}
      {...rest}
    >
      <Icon
        name={spec.icon}
        size={spec.iconSize}
        className={isProcessing ? styles.cbtnProcessingIcon : undefined}
      />
    </button>
  );
}

/**
 * RecordingTimeline — the "live recording" surface that replaces the
 * upload button + mode badge during voice capture. Matches the Figma
 * `.AI_Action_Bar / State=Recording` node: light-blue pill, monospaced
 * mm:ss timer, an active waveform on the left and a faded placeholder
 * waveform on the right.
 *
 * The waveform is a scrolling ring buffer of synthesized amplitude
 * samples. A new sample is pushed every `RECORDING_SAMPLE_MS`; once the
 * window fills, oldest samples fall off the left. Per-bar `height` and
 * `opacity` are CSS-transitioned (so changes ease between ticks), and
 * the newest bar plays a one-shot scaleY pop-in. `prefers-reduced-motion`
 * disables the transitions and the pop-in.
 */
interface RecordingTimelineProps {
  elapsedMs: number;
}

interface WaveformSample {
  id: number;
  value: number;
}

function RecordingTimeline({ elapsedMs }: RecordingTimelineProps) {
  const [samples, setSamples] = useState<WaveformSample[]>([]);
  const nextIdRef = useRef(0);
  const lastValueRef = useRef(0.3);

  useEffect(() => {
    const id = setInterval(() => {
      const value = synthesizeSample(performance.now(), lastValueRef.current);
      lastValueRef.current = value;
      // Compute the sample id outside the updater so the updater stays pure
      // (React 19 StrictMode invokes updaters twice in dev).
      const sampleId = nextIdRef.current++;
      setSamples((prev) => {
        const next = [...prev, { id: sampleId, value }];
        return next.length > RECORDING_ACTIVE_BARS
          ? next.slice(-RECORDING_ACTIVE_BARS)
          : next;
      });
    }, RECORDING_SAMPLE_MS);
    return () => clearInterval(id);
  }, []);

  // Keep total bar count constant by padding the future section while the
  // active window fills up during the first ~1.8s of recording.
  const futureBars = RECORDING_FUTURE_BARS + (RECORDING_ACTIVE_BARS - samples.length);
  const newestId = samples.length > 0 ? samples[samples.length - 1].id : -1;
  const lastIndex = samples.length - 1;

  return (
    <div
      className={styles.recordingPill}
      // Intentionally NOT a live region: the pill's accessible name is static
      // ("Recording") and its descendants change ~11x/sec, so any aria-live
      // treatment risks noisy or implementation-dependent announcements. The
      // recording state is conveyed visually; SR users can still discover it
      // on navigation via the aria-label below. If/when we need an explicit
      // "Recording started/stopped" announcement, add a dedicated one-shot
      // visually-hidden live region rather than re-promoting this container.
      role="group" aria-label="Recording"
    >
      <span className={styles.recordingTimer} aria-hidden="true">
        {formatRecordingTime(elapsedMs)}
      </span>
      <span className={styles.recordingWaveform} aria-hidden="true">
        {samples.map((s, i) => {
          const age = lastIndex - i; // 0 = newest, larger = older
          const opacity = Math.max(0.4, 1 - age * 0.03);
          const height = 12 + s.value * 88;
          return (
            <span
              key={s.id}
              className={cx(
                styles.recordingBarActive,
                s.id === newestId && styles.recordingBarEnter,
              )}
              style={
                {
                  '--bar-h': `${height}%`,
                  '--bar-opacity': opacity,
                } as CSSProperties
              }
            />
          );
        })}
        {Array.from({ length: futureBars }).map((_, i) => (
          <span key={`f-${i}`} className={styles.recordingBarFuture} />
        ))}
      </span>
    </div>
  );
}

/**
 * Synthesizes one amplitude sample in [0.05, 1] for the recording waveform.
 * Mixes a slow speech envelope, syllabic cadence, sparse plosive spikes, a
 * small noise floor, and light autocorrelation with the previous sample so
 * neighbouring bars feel related rather than independently random.
 */
function synthesizeSample(t: number, prev: number): number {
  const TAU = Math.PI * 2;
  const env = 0.45 + 0.22 * Math.sin((t * TAU * 1.5) / 1000);
  const syl = 0.15 * Math.sin((t * TAU * 6) / 1000);
  const spike = Math.random() < 0.08 ? 0.25 + Math.random() * 0.2 : 0;
  const noise = (Math.random() - 0.5) * 0.12;
  const raw = env + syl + spike + noise;
  const next = prev * 0.3 + raw * 0.7;
  return Math.max(0.05, Math.min(1, next));
}

/** All composer footer states from the Figma `.AI_Action_Bar` component set. */
type ComposerActionState =
  | 'idle'      // upload + voice
  | 'typing'    // upload + send (text present)
  | 'thinking'  // upload + stop (assistant is generating, interruptible)
  | 'recording' // recording timeline + cancel + send-recording
  | 'processing'; // upload + processing spinner (transcribing voice)

function deriveComposerState(args: {
  recording: boolean;
  transcribing: boolean;
  isGenerating: boolean;
  hasText: boolean;
}): ComposerActionState {
  if (args.recording) return 'recording';
  if (args.transcribing) return 'processing';
  if (args.isGenerating) return 'thinking';
  if (args.hasText) return 'typing';
  return 'idle';
}

function formatRecordingTime(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Bar counts in the recording waveform. Tuned to fill the available pill
 *  width inside the AI panel without overflow at the default panel size. */
const RECORDING_ACTIVE_BARS = 20;
const RECORDING_FUTURE_BARS = 36;
/** How often a new amplitude sample is pushed into the scrolling buffer. */
const RECORDING_SAMPLE_MS = 90;

/* ============================================================
 *                       Helpers
 * ============================================================ */

/** Crypto-strong id for a new persisted conversation. Falls back to a
 *  timestamp + random suffix on platforms without `crypto.randomUUID`
 *  (rare in modern browsers, but cheap insurance). */
function newConversationId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `c-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const TITLE_MAX_LENGTH = 60;

/** Title shown in the history list. Derived once from the first user
 *  message and re-applied on every save; if the user edits or extends
 *  their first message the title would update on the next persist. */
function deriveConversationTitle(firstUser: Message): string {
  const text = firstUser.kind === 'text' ? firstUser.content.trim() : '';
  if (!text) return 'New conversation';
  if (text.length <= TITLE_MAX_LENGTH) return text;
  return text.slice(0, TITLE_MAX_LENGTH).trimEnd() + '…';
}

/** Header-bar title for the chat view. Returns null for the empty
 *  state so the caller can show the design's “New conversation”. */
function deriveConversationTitleFromMessages(messages: Message[]): string | null {
  const firstUser = messages.find((m) => m.role === 'user');
  if (!firstUser) return null;
  return deriveConversationTitle(firstUser);
}

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** Row-level timestamp for the history list. Chosen so the label
 *  complements (rather than duplicates) the group header above it:
 *   • today / yesterday → clock time (`3:42 PM`)
 *   • previous 7 days  → “N days ago”
 *   • older            → locale date
 *  The “Just now” affordance is preserved for the first minute so a
 *  fresh send doesn't look stale. */
function formatRowTime(ms: number, bucket: HistoryBucket): string {
  if (Date.now() - ms < MINUTE_MS) return 'Just now';
  if (bucket === 'today' || bucket === 'yesterday') {
    return new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  if (bucket === 'week') {
    const days = Math.max(2, Math.floor((Date.now() - ms) / DAY_MS));
    return `${days} days ago`;
  }
  return new Date(ms).toLocaleDateString();
}

/** History list date buckets. Ordered newest → oldest so the renderer
 *  can iterate the keys directly to produce the section order. */
type HistoryBucket = 'today' | 'yesterday' | 'week' | 'older';
const HISTORY_BUCKET_ORDER: readonly HistoryBucket[] = ['today', 'yesterday', 'week', 'older'];
const HISTORY_BUCKET_LABELS: Record<HistoryBucket, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  week: 'Previous 7 days',
  older: 'Older',
};

/** Bucket a timestamp into one of the four history sections. Uses local
 *  calendar-day boundaries (via the Date constructor's day arithmetic so
 *  DST transitions don't push rows into the wrong section) so “Today”
 *  means today's calendar date, not the past 24 hours. */
function bucketFor(ms: number): HistoryBucket {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  const todayStart = new Date(y, m, d).getTime();
  const yesterdayStart = new Date(y, m, d - 1).getTime();
  const weekStart = new Date(y, m, d - 7).getTime();
  if (ms >= todayStart) return 'today';
  if (ms >= yesterdayStart) return 'yesterday';
  if (ms >= weekStart) return 'week';
  return 'older';
}

/** Group an already-sorted conversation list by date bucket, preserving
 *  the input order within each bucket and the bucket order from
 *  `HISTORY_BUCKET_ORDER`. Empty buckets are dropped. */
function groupByBucket(
  conversations: ChatConversation[],
): Array<[HistoryBucket, ChatConversation[]]> {
  const map = new Map<HistoryBucket, ChatConversation[]>();
  for (const c of conversations) {
    const b = bucketFor(c.updatedAt);
    const list = map.get(b);
    if (list) list.push(c);
    else map.set(b, [c]);
  }
  return HISTORY_BUCKET_ORDER.filter((b) => map.has(b)).map((b) => [b, map.get(b)!]);
}

function totalChars(m: Message): number {
  if (m.kind === 'text') return m.content.length;
  return m.content.reduce((sum, b) => sum + richBlockLength(b), 0);
}

function richBlockLength(b: RichBlock): number {
  if (b.type === 'p') return b.text.length;
  if (b.type === 'ol') return b.items.reduce((s, it) => s + it.length, 0);
  if (b.type === 'code') return b.code.length;
  if (b.type === 'table') {
    const head = b.columns.reduce((s, c) => s + c.length, 0);
    const body = b.rows.reduce((s, r) => s + r.reduce((s2, c) => s2 + c.length, 0), 0);
    return head + body;
  }
  return b.links.reduce((s, l) => s + l.label.length, 0);
}

/** Return a copy of `m` with only the first `progress` characters revealed. */
function sliceMessage(m: Message, progress: number): Message {
  if (m.kind === 'text') {
    return { ...m, content: m.content.slice(0, progress) };
  }
  const blocks: RichBlock[] = [];
  let consumed = 0;
  for (const b of m.content) {
    if (consumed >= progress) break;
    const remaining = progress - consumed;
    if (b.type === 'p') {
      const text = b.text.slice(0, remaining);
      blocks.push({ ...b, text });
      consumed += text.length;
    } else if (b.type === 'ol') {
      const items: string[] = [];
      let used = 0;
      for (const it of b.items) {
        if (used >= remaining) break;
        const slice = it.slice(0, remaining - used);
        items.push(slice);
        used += slice.length;
      }
      blocks.push({ ...b, items });
      consumed += used;
    } else {
      // Atomic blocks (code / table / sources) reveal wholesale: only emit
      // them once the stream has fully passed their length, so they pop in
      // after the preceding text finishes typing rather than rendering torn.
      const len = richBlockLength(b);
      if (remaining < len) break;
      blocks.push(b);
      consumed += len;
    }
  }
  return { ...m, content: blocks };
}

function richToPlainText(blocks: RichBlock[]): string {
  return blocks
    .map((b) => {
      if (b.type === 'p') return b.text;
      if (b.type === 'ol') return b.items.map((it, n) => `${n + 1}. ${it}`).join('\n');
      if (b.type === 'code') return '```\n' + b.code + '\n```';
      if (b.type === 'table') {
        const head = b.columns.join('\t');
        const body = b.rows.map((r) => r.join('\t')).join('\n');
        return `${head}\n${body}`;
      }
      return (
        'Sources: ' +
        b.links.map((l) => (l.href ? `${l.label} (${l.href})` : l.label)).join(', ')
      );
    })
    .join('\n\n');
}

/** Listen for the OS reduced-motion preference. */
function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(mq.matches);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduce;
}

/* ============================================================
 *                       Placeholder data
 * ============================================================ */

function iconForKind(kind: AiContextItem['kind']): string {
  switch (kind) {
    case 'user':
      return 'User';
    case 'group':
      return 'UsersThree';
    case 'device':
      return 'Desktop';
    default:
      return 'Tag';
  }
}

const DUMMY_REPLIES: CannedReply[] = [
  // 1) CODE-FIRST — Azure AD sync failure, diagnosed from the connector log.
  {
    kind: 'rich',
    content: [
      {
        type: 'p',
        text:
          'When Active Roles stops syncing to Azure AD, the fastest signal is the ' +
          'Synchronization Service run history. Open the most recent failed run and expand ' +
          'the connector step — an expired service credential surfaces as a 401 right at the ' +
          'top of the log:',
      },
      {
        type: 'code',
        language: 'log',
        code:
          "[10:42:07] Run 'Azure AD — Delta' started (workflow: AAD-DELTA)\n" +
          "[10:42:09] Step 'Azure AD' failed: 401 Unauthorized\n" +
          "[10:42:09]   → credential 'aad-sync@contoso.onmicrosoft.com' token expired\n" +
          "[10:42:09]   → 0 of 1,204 pending changes exported\n" +
          '[10:42:10] Run finished with errors (elapsed 00:00:03)',
      },
      {
        type: 'p',
        text:
          "The OAuth token behind that service account has lapsed, so every export in the " +
          'delta pipeline is rejected before it starts. Re-authorize the connection under ' +
          'Configuration → Connections → Azure AD, then run a full sync to flush the backlog ' +
          'and confirm the delta runs recover.',
      },
      {
        type: 'sources',
        links: [
          { label: 'Synchronization Service Guide' },
          { label: 'Azure AD Connector' },
        ],
      },
    ],
  },
  // 2) TABLE-FIRST — connector health snapshot across the sync configuration.
  {
    kind: 'rich',
    content: [
      {
        type: 'p',
        text:
          "Here's the live health of every connector in your sync configuration, ordered by " +
          'the last run that touched each system:',
      },
      {
        type: 'table',
        columns: ['Connector', 'Objects', 'Last run', 'State'],
        rows: [
          ['On-prem AD', '48,210', '2 min ago', 'Healthy'],
          ['Azure AD', '31,904', '3 hrs ago', 'Auth error'],
          ['ServiceNow', '6,120', '11 min ago', 'Healthy'],
          ['SQL — HR', '12,750', '1 hr ago', 'Warning'],
        ],
      },
      {
        type: 'p',
        text:
          'Azure AD is the only hard blocker — its credential expired about three hours ago, ' +
          'which is why exports are queuing. The SQL — HR warning is a slow run, not a ' +
          'failure: its last delta took 9 minutes against a 5-minute threshold. Everything ' +
          'else is flowing normally.',
      },
      {
        type: 'sources',
        links: [{ label: 'Connector Status' }, { label: 'Run History' }],
      },
    ],
  },
  // 3) LIST-FIRST — delegate location management via a deputization.
  {
    kind: 'rich',
    content: [
      {
        type: 'p',
        text:
          'You can hand off location management temporarily with a deputization in the Web ' +
          'Portal. It transfers every responsibility in the selected role class — including ' +
          'Locations — to a deputy for a fixed window, which is ideal for vacation or leave ' +
          'coverage without permanently reassigning ownership.',
      },
      { type: 'p', text: 'To set it up:' },
      {
        type: 'ol',
        items: [
          'Open Responsibilities → Delegation and choose New delegation.',
          'Pick the identity that will act as your deputy.',
          'Set the delegation type to Deputization and select the Locations role class.',
          'Define the Valid from and Valid until dates that bound the hand-off.',
          'Optionally require the deputy to confirm before the delegation activates.',
          'Review the summary and save — the deputy is notified by email immediately.',
        ],
      },
      {
        type: 'p',
        text:
          'The delegation ends automatically at the Valid until date; you can also revoke it ' +
          'early from the same screen and responsibilities snap back to you on the next ' +
          'portal refresh.',
      },
      {
        type: 'sources',
        links: [{ label: 'Delegation & Deputization' }, { label: 'Web Portal Guide' }],
      },
    ],
  },
  // 4) TEXT — provisioning policy scope.
  {
    kind: 'text',
    content:
      'User provisioning is driven by Active Roles policies attached to the target container. ' +
      'Open the policy that covers the OU in question, adjust its scope or schedule, and the ' +
      'change takes effect on the next synchronization cycle — no restart required. If you ' +
      'need it applied immediately, run the policy on-demand from its context menu.',
  },
  // 5) CODE — bulk import via the Management Shell, with a safety note.
  {
    kind: 'rich',
    content: [
      {
        type: 'p',
        text:
          'For a repeatable import, use the Active Roles Management Shell. Point it at your ' +
          'CSV and pipe each row into New-QADUser so every account lands in the right OU with ' +
          'a consistent naming scheme:',
      },
      {
        type: 'code',
        language: 'powershell',
        code:
          "Import-Csv .\\new-hires.csv | ForEach-Object {\n" +
          '  New-QADUser -Name $_.DisplayName `\n' +
          '    -ParentContainer $_.TargetOU `\n' +
          '    -SamAccountName  $_.Sam `\n' +
          '    -UserPassword    $_.TempPassword `\n' +
          "    -Department      $_.Department |\n" +
          '    Enable-QADUser\n' +
          '}',
      },
      {
        type: 'p',
        text:
          'Run it against a staging OU first and review the queued changes in the console ' +
          'before promoting to production. Wrapping the pipeline in a try/catch lets you log ' +
          'the row that failed instead of halting the whole batch.',
      },
      {
        type: 'sources',
        links: [{ label: 'Management Shell Reference' }, { label: 'Bulk Operations' }],
      },
    ],
  },
  // 6) LIST — audit recent permission changes.
  {
    kind: 'rich',
    content: [
      {
        type: 'p',
        text:
          'The Change History report is the authoritative record for permission changes — it ' +
          'captures who made each modification, the before/after values, and the workstation ' +
          'it originated from. To pull the last week of activity:',
      },
      {
        type: 'ol',
        items: [
          'Open Reporting → Change History.',
          'Filter by object class — start with User and Group.',
          'Set the action filter to Permission granted and Permission revoked.',
          'Narrow the date range to the last 7 days.',
          'Export the result as CSV for offline review or attestation.',
        ],
      },
      {
        type: 'sources',
        links: [{ label: 'Change History Report' }, { label: 'Reporting Overview' }],
      },
    ],
  },
  // 7) TABLE — provisioning policy comparison.
  {
    kind: 'rich',
    content: [
      {
        type: 'p',
        text: 'Here is how your three active provisioning policies compare at a glance:',
      },
      {
        type: 'table',
        columns: ['Policy', 'Scope', 'Trigger', 'Status'],
        rows: [
          ['Onboarding', 'All new hires', 'HR record created', 'Enabled'],
          ['Contractor', 'External identities', 'Sponsor approval', 'Enabled'],
          ['Offboarding', 'Disabled accounts', 'Termination date', 'Paused'],
        ],
      },
      {
        type: 'p',
        text:
          'Offboarding is paused because its termination feed from Workday is mid-migration — ' +
          're-enable it once the new connector is validated so disabled accounts are cleaned ' +
          'up on schedule.',
      },
      {
        type: 'sources',
        links: [{ label: 'Provisioning Policies' }],
      },
    ],
  },
  // 8) TEXT — password reset via the Helpdesk site.
  {
    kind: 'text',
    content:
      'In the Password Manager Helpdesk site, search for the user and confirm their identity ' +
      'with the configured verification questions, then choose Manage → Reset Password. The ' +
      'new password propagates to every connected system on the next synchronization, so the ' +
      'user can sign in everywhere without a separate reset per application.',
  },
];
