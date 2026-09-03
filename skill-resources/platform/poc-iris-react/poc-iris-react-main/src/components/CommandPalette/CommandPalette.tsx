import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../lib/cx.js';
import { navigate } from '../../lib/router.js';
import { useUsers } from '../../lib/usersStore.js';
import { useAppShell } from '../../lib/appShellContext.js';
import { useVertical } from '../../lib/verticals.js';
import { useTheme, THEMES, type ThemeValue } from '../../lib/useTheme.js';
import {
  PAGE_ITEMS,
  IDENTITY_COMMAND_ITEMS,
  buildUserItems,
  filterItems,
  type CommandItem,
  type CommandScope,
} from '../../lib/commands.js';
import {
  addRecentItem,
  addRecentSearch,
  getRecentItems,
  getRecentSearches,
  removeRecentItem,
  removeRecentSearch,
} from '../../lib/searchHistoryStore.js';
import { Icon } from '../Icon/Icon.js';
import { Tabs, type TabItem } from '../Tabs/Tabs.js';
import styles from './CommandPalette.module.css';

/** A normalized, renderable row. Decouples data (CommandItem/recents) from
 *  the palette's rendering + keyboard model. */
interface Row {
  key: string;
  icon: string;
  label: string;
  secondary?: string;
  /** Run on Enter / click. */
  onSelect: () => void;
  /** When set, a remove (×) control is shown that calls this. */
  onRemove?: () => void;
  /** Keep the palette open after selecting (e.g. re-running a recent query). */
  keepOpen?: boolean;
}

interface Section {
  id: string;
  title: string;
  rows: Row[];
}

const SCOPES: TabItem[] = [
  { value: 'all', label: 'All' },
  { value: 'users', label: 'Users' },
  { value: 'pages', label: 'Pages' },
];

const CLOSE_ANIM_MS = 200;

/** Prefix used by the theme command rows (`theme-<value>`). */
const THEME_ROW_PREFIX = 'theme-';
const THEME_BODY_CLASSES = THEMES.map((t) => t.bodyClass);

/** Swap the body theme class for a live preview — WITHOUT persisting to
 *  storage (only a committed selection should persist). */
function previewThemeClass(value: ThemeValue): void {
  const def = THEMES.find((t) => t.value === value);
  if (!def) return;
  document.body.classList.remove(...THEME_BODY_CLASSES);
  document.body.classList.add(def.bodyClass);
}

/** Read the theme currently applied to <body> (source of truth across the app). */
function readBodyTheme(): ThemeValue {
  for (const t of THEMES) {
    if (document.body.classList.contains(t.bodyClass)) return t.value;
  }
  return 'light';
}

/**
 * CommandPalette — the global search / ⌘K panel. Rendered once at the app
 * root so its open state and keyboard shortcut are global and survive
 * navigation. Modeled on Modal (portal, scrim, ESC, scroll lock,
 * reduced-motion) with a combobox/listbox keyboard model where focus stays
 * in the input and `aria-activedescendant` tracks the highlighted row.
 */
export function CommandPalette() {
  const { searchOpen, setSearchOpen, setAiOpen } = useAppShell();
  const { theme, setTheme, themes } = useTheme();
  const { users } = useUsers();

  // Scope results to the active shell: inside Identity Manager the palette
  // searches the IdM taxonomy only (not global pages or directory users), and
  // its scope tabs are hidden (a single flat list).
  const isIdM = useVertical().id === 'identity-manager';

  const [mounted, setMounted] = useState(searchOpen);
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<CommandScope>('all');
  const [active, setActive] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [recentItems, setRecentItems] = useState(() => getRecentItems());

  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const listId = 'command-palette-list';

  // Theme-preview bookkeeping: the theme applied when the palette opened, and
  // whether the user committed a theme (so we don't revert the preview on close).
  const originalThemeRef = useRef<ThemeValue | null>(null);
  const themeCommittedRef = useRef(false);

  const close = useCallback(() => setSearchOpen(false), [setSearchOpen]);
  const refreshRecents = useCallback(() => {
    setRecentSearches(getRecentSearches());
    setRecentItems(getRecentItems());
  }, []);

  /* ---- global ⌘K / Ctrl+K toggle (always mounted) ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.repeat && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setSearchOpen]);

  /* ---- mount/unmount with exit animation (mirrors Modal) ---- */
  useEffect(() => {
    if (searchOpen) {
      setMounted(true);
      return undefined;
    }
    const t = setTimeout(() => setMounted(false), CLOSE_ANIM_MS);
    return () => clearTimeout(t);
  }, [searchOpen]);

  /* ---- on open: reset, load recents, lock scroll ---- */
  useEffect(() => {
    if (!searchOpen) return undefined;
    setQuery('');
    setActive(0);
    refreshRecents();

    // Snapshot the live theme so hover/arrow previews can be reverted on close.
    originalThemeRef.current = readBodyTheme();
    themeCommittedRef.current = false;

    const previouslyFocused = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      // Undo any theme preview unless the user committed a theme selection.
      if (!themeCommittedRef.current && originalThemeRef.current) {
        previewThemeClass(originalThemeRef.current);
      }
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [searchOpen, refreshRecents]);

  /* ---- autofocus the input once the panel is actually mounted ---- */
  useEffect(() => {
    if (!(searchOpen && mounted)) return undefined;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [searchOpen, mounted]);

  /* ---- searchable pools ---- */
  const userItems = useMemo(() => buildUserItems(users), [users]);

  const actionItems = useMemo<CommandItem[]>(() => {
    const themeActions: CommandItem[] = themes.map((t) => ({
      id: `theme-${t.value}`,
      kind: 'action',
      label: `Theme: ${t.label}`,
      icon: t.icon,
      secondary: t.value === theme ? 'Current' : undefined,
      keywords: `theme appearance dark light contrast ${t.label}`,
      run: () => setTheme(t.value),
    }));
    return [
      {
        id: 'action-ai',
        kind: 'action',
        label: 'Toggle AI panel',
        icon: 'Sparkle',
        keywords: 'ai assistant chat ask',
        run: () => setAiOpen((v) => !v),
      },
      ...themeActions,
    ];
  }, [themes, theme, setTheme, setAiOpen]);

  /* ---- build sections for the current query + scope ---- */
  const commit = useCallback(
    (item: CommandItem) => {
      const q = query.trim();
      if (q) addRecentSearch(q);
      if ((item.kind === 'page' || item.kind === 'user') && item.hash) {
        addRecentItem({
          id: item.id,
          kind: item.kind,
          label: item.label,
          icon: item.icon,
          secondary: item.secondary,
          hash: item.hash,
        });
      }
      // A committed theme should persist — don't revert it when the palette closes.
      if (item.id.startsWith(THEME_ROW_PREFIX)) themeCommittedRef.current = true;
      if (item.run) item.run();
      else if (item.hash) navigate(item.hash);
      close();
    },
    [query, close],
  );
  const toRow = useCallback(
    (item: CommandItem): Row => ({
      key: item.id,
      icon: item.icon,
      label: item.label,
      secondary: item.secondary,
      onSelect: () => commit(item),
    }),
    [commit],
  );

  const sections = useMemo<Section[]>(() => {
    const q = query.trim();
    const result: Section[] = [];

    // In the IdM shell the palette searches the IdM taxonomy only, its scope
    // tabs are hidden, and scope is forced to 'all' so a previously-selected
    // pages/users scope can't strand the view or hide the Ask AI row.
    const effScope: CommandScope = isIdM ? 'all' : scope;
    const pagePool = isIdM ? IDENTITY_COMMAND_ITEMS : PAGE_ITEMS;

    if (q) {
      const pages = effScope === 'users' ? [] : filterItems(pagePool, q);
      const usersMatched =
        isIdM || effScope === 'pages' ? [] : filterItems(userItems, q).slice(0, 6);
      const actions = effScope === 'all' ? filterItems(actionItems, q) : [];

      if (pages.length) result.push({ id: 'pages', title: 'Jump to', rows: pages.map(toRow) });
      if (usersMatched.length)
        result.push({ id: 'users', title: 'Users', rows: usersMatched.map(toRow) });
      if (actions.length)
        result.push({ id: 'actions', title: 'Actions', rows: actions.map(toRow) });
      if (effScope === 'all') {
        result.push({
          id: 'ai',
          title: 'Ask AI',
          rows: [
            {
              key: 'ai-ask',
              icon: 'Sparkle',
              label: `Ask AI about “${q}”`,
              onSelect: () => {
                addRecentSearch(q);
                setAiOpen(true);
                close();
              },
            },
          ],
        });
      }
      return result;
    }

    // Empty query → recents + suggestions.
    if (effScope !== 'pages' && recentSearches.length) {
      result.push({
        id: 'recent-searches',
        title: 'Recent searches',
        rows: recentSearches.map((s) => ({
          key: `recent-search-${s}`,
          icon: 'ClockCounterClockwise',
          label: s,
          keepOpen: true,
          onSelect: () => {
            setQuery(s);
            inputRef.current?.focus();
          },
          onRemove: () => {
            removeRecentSearch(s);
            refreshRecents();
          },
        })),
      });
    }

    const viewable = recentItems.filter((i) => {
      // Inside IdM, only surface recents that belong to the IdM shell.
      if (isIdM) return i.hash.startsWith('#/identity');
      return effScope === 'all' || (effScope === 'users' ? i.kind === 'user' : i.kind === 'page');
    });
    if (viewable.length) {
      result.push({
        id: 'recent-items',
        title: 'Recently viewed',
        rows: viewable.map((i) => ({
          key: `recent-item-${i.id}`,
          icon: i.icon,
          label: i.label,
          secondary: i.secondary,
          onSelect: () => {
            navigate(i.hash);
            close();
          },
          onRemove: () => {
            removeRecentItem(i.id);
            refreshRecents();
          },
        })),
      });
    }

    const suggestions = effScope === 'users' ? userItems.slice(0, 5) : pagePool;
    result.push({
      id: 'suggestions',
      title: 'Try searching',
      rows: suggestions.map(toRow),
    });
    return result;
  }, [
    query,
    scope,
    isIdM,
    userItems,
    actionItems,
    recentSearches,
    recentItems,
    toRow,
    refreshRecents,
    setAiOpen,
    close,
  ]);

  /* Flatten for arrow navigation + activedescendant. */
  const flatRows = useMemo(() => sections.flatMap((s) => s.rows), [sections]);

  // Clamp the active index whenever the result set changes.
  useEffect(() => {
    setActive((a) => (flatRows.length === 0 ? 0 : Math.min(a, flatRows.length - 1)));
  }, [flatRows.length]);

  const activeId = flatRows.length ? `command-opt-${active}` : undefined;

  // The theme to preview from the active row, if it is a theme command.
  const previewTheme = useMemo<ThemeValue | null>(() => {
    const key = flatRows[active]?.key;
    return key && key.startsWith(THEME_ROW_PREFIX)
      ? (key.slice(THEME_ROW_PREFIX.length) as ThemeValue)
      : null;
  }, [flatRows, active]);

  // Live-apply the previewed theme (hover or arrow-nav); fall back to the
  // theme that was active when the palette opened when no theme row is focused.
  useEffect(() => {
    if (!searchOpen) return;
    if (previewTheme) previewThemeClass(previewTheme);
    else if (originalThemeRef.current) previewThemeClass(originalThemeRef.current);
  }, [previewTheme, searchOpen]);

  // Keep the highlighted row scrolled into view.
  useEffect(() => {
    if (!searchOpen) return;
    const el = listRef.current?.querySelector<HTMLElement>(`#command-opt-${active}`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active, searchOpen]);

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (flatRows.length ? (a + 1) % flatRows.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (flatRows.length ? (a - 1 + flatRows.length) % flatRows.length : 0));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(Math.max(0, flatRows.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      flatRows[active]?.onSelect();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  if (!mounted) return null;

  let rowIndex = -1;

  return createPortal(
    <div
      className={cx(styles.root, searchOpen && styles.rootOpen)}
      onClick={close}
    >
      <div
        className={cx(styles.panel, searchOpen && styles.panelOpen)}
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.searchRow}>
          <Icon name="MagnifyingGlass" size="20px" className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="Search users, pages, actions…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKeyDown}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            aria-label="Search"
          />
          <span className={styles.kbdHint} aria-hidden="true">
            <kbd className={styles.kbd}>Esc</kbd>
          </span>
        </div>

        {!isIdM && (
          <div className={styles.scopeRow}>
            <Tabs
              items={SCOPES}
              value={scope}
              onChange={(value) => {
                setScope(value as CommandScope);
                setActive(0);
              }}
              ariaLabel="Search scope"
              className={styles.scopeTabs}
            />
          </div>
        )}

        <div className={styles.list} id={listId} role="listbox" ref={listRef}>
          {flatRows.length === 0 ? (
            <div className={styles.empty}>No results for “{query}”</div>
          ) : (
            sections.map((section) => (
              <div key={section.id} className={styles.group} role="group" aria-label={section.title}>
                <div className={styles.groupTitle}>{section.title}</div>
                {section.rows.map((row) => {
                  rowIndex += 1;
                  const index = rowIndex;
                  const isActive = index === active;
                  return (
                    <div
                      key={row.key}
                      id={`command-opt-${index}`}
                      role="option"
                      aria-selected={isActive}
                      className={cx(styles.row, isActive && styles.rowActive)}
                      onMouseMove={() => setActive(index)}
                      onClick={row.onSelect}
                    >
                      <Icon name={row.icon} size="18px" className={styles.rowIcon} />
                      <span className={styles.rowText}>
                        <span className={styles.rowLabel}>{row.label}</span>
                        {row.secondary && (
                          <span className={styles.rowSecondary}>{row.secondary}</span>
                        )}
                      </span>
                      {row.onRemove ? (
                        <button
                          type="button"
                          className={styles.rowRemove}
                          aria-label={`Remove ${row.label}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            row.onRemove?.();
                          }}
                        >
                          <Icon name="X" size="14px" />
                        </button>
                      ) : (
                        isActive && (
                          <span className={styles.rowEnter} aria-hidden="true">
                            <kbd className={styles.kbd}>↵</kbd>
                          </span>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className={styles.footer} aria-hidden="true">
          <span className={styles.footerHint}>
            <kbd className={styles.kbd}>↑</kbd>
            <kbd className={styles.kbd}>↓</kbd>
            to navigate
          </span>
          <span className={styles.footerHint}>
            <kbd className={styles.kbd}>↵</kbd>
            to select
          </span>
          <span className={styles.footerHint}>
            <kbd className={styles.kbd}>Esc</kbd>
            to close
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
