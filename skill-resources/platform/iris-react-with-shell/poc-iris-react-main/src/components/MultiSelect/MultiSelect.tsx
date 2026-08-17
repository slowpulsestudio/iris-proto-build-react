import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../lib/cx.js';
import { Icon } from '../Icon/Icon.js';
import { Checkbox } from '../Checkbox/Checkbox.js';
import { TextInput } from '../TextInput/TextInput.js';
import styles from './MultiSelect.module.css';

export interface MultiSelectOption {
  value: string;
  /** Primary line. */
  title: string;
  /** Secondary line (e.g. an object ID). */
  subtitle?: string;
  /** Named icon from the shared manifest (uses `currentColor`). */
  icon?: string;
  /** Custom leading visual; takes precedence over `icon`. */
  visual?: ReactNode;
  disabled?: boolean;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  /** Controlled set of selected option values. */
  selected: Set<string>;
  onSelectionChange: (next: Set<string>) => void;
  /** Base trigger label, e.g. "All directories". */
  label: string;
  align?: 'start' | 'end';
  searchPlaceholder?: string;
  ariaLabel?: string;
  className?: string;
}

interface Pos {
  top: number;
  left: number;
  align: 'start' | 'end';
}

/**
 * MultiSelect — a variant of the popover menu that allows multiple items to
 * be selected. Styled after `Menu`; stays open while items are toggled.
 *
 * Features: inline search in the header, list rows with checkbox + icon +
 * title + subtitle, a footer with Select all / Clear, and a selected count
 * shown in the trigger.
 */
export function MultiSelect({
  options,
  selected,
  onSelectionChange,
  label,
  align = 'start',
  searchPlaceholder = 'Search…',
  ariaLabel = 'Multi-select',
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);
  const [query, setQuery] = useState('');
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const close = useCallback(() => setOpen(false), []);
  const toggleOpen = useCallback(() => setOpen((v) => !v), []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        (o.subtitle?.toLowerCase().includes(q) ?? false),
    );
  }, [options, query]);

  const toggle = useCallback(
    (value: string) => {
      const next = new Set(selected);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      onSelectionChange(next);
    },
    [selected, onSelectionChange],
  );

  const selectAllVisible = useCallback(() => {
    const next = new Set(selected);
    for (const o of visible) if (!o.disabled) next.add(o.value);
    onSelectionChange(next);
  }, [selected, visible, onSelectionChange]);

  const clearAll = useCallback(() => onSelectionChange(new Set()), [onSelectionChange]);

  // Position the popover directly below the trigger, tracking scroll/resize.
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const compute = () => {
      const t = triggerRef.current;
      if (!t) return;
      const rect = t.getBoundingClientRect();
      setPos({
        top: rect.bottom + 4,
        left: align === 'end' ? rect.right : rect.left,
        align,
      });
    };
    compute();
    const scrollOpts: AddEventListenerOptions = { capture: true, passive: true };
    window.addEventListener('scroll', compute, scrollOpts);
    window.addEventListener('resize', compute);
    return () => {
      window.removeEventListener('scroll', compute, scrollOpts);
      window.removeEventListener('resize', compute);
    };
  }, [open, align]);

  // Click-outside + Escape to dismiss.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (
        (target && popRef.current?.contains(target)) ||
        (target && triggerRef.current?.contains(target))
      )
        return;
      close();
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  // Focus the search field when the popover opens; reset the query on close.
  useEffect(() => {
    if (open) searchRef.current?.focus();
    else setQuery('');
  }, [open]);

  const optionEls = useCallback(
    () =>
      Array.from(
        popRef.current?.querySelectorAll<HTMLElement>(
          '[role="option"]:not([aria-disabled="true"])',
        ) ?? [],
      ),
    [],
  );

  const focusOption = useCallback(
    (index: number) => {
      const els = optionEls();
      if (els.length) els[Math.max(0, Math.min(index, els.length - 1))].focus();
    },
    [optionEls],
  );

  const onListKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
      e.preventDefault();
      const els = optionEls();
      if (!els.length) return;
      const i = els.indexOf(document.activeElement as HTMLElement);
      if (e.key === 'ArrowDown') focusOption(i < 0 ? 0 : (i + 1) % els.length);
      else if (e.key === 'ArrowUp') focusOption(i <= 0 ? els.length - 1 : i - 1);
      else if (e.key === 'Home') focusOption(0);
      else focusOption(els.length - 1);
    } else if (e.key === ' ' || e.key === 'Enter') {
      const el = document.activeElement as HTMLElement | null;
      const value = el?.getAttribute('data-value');
      if (value && el?.getAttribute('aria-disabled') !== 'true') {
        e.preventDefault();
        toggle(value);
      }
    }
  };

  const count = selected.size;
  const triggerLabel = count > 0 ? `${label} (${count} selected)` : label;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={cx(styles.trigger, className)}
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={styles.triggerLabel}>{triggerLabel}</span>
        <Icon name="CaretDown" size="16px" className={styles.caret} />
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={popRef}
            role="listbox"
            aria-multiselectable="true"
            aria-label={ariaLabel}
            className={styles.pop}
            data-align={pos.align}
            style={{
              top: pos.top,
              ...(pos.align === 'end'
                ? { right: window.innerWidth - pos.left }
                : { left: pos.left }),
            }}
          >
            <div className={styles.search}>
              <TextInput
                ref={searchRef}
                iconLead="MagnifyingGlass"
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label={searchPlaceholder}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    focusOption(0);
                  }
                }}
              />
            </div>

            <div className={styles.list} role="presentation" onKeyDown={onListKeyDown}>
              {visible.length === 0 ? (
                <div className={styles.empty}>No matches</div>
              ) : (
                visible.map((o) => {
                  const isSel = selected.has(o.value);
                  return (
                    <div
                      key={o.value}
                      role="option"
                      aria-selected={isSel}
                      aria-disabled={o.disabled || undefined}
                      data-value={o.value}
                      tabIndex={-1}
                      className={cx(styles.option, isSel && styles.optionSelected)}
                      onClick={() => {
                        if (!o.disabled) toggle(o.value);
                      }}
                    >
                      <span className={styles.check}>
                        <Checkbox checked={isSel} disabled={o.disabled} tabIndex={-1} />
                      </span>
                      {(o.visual !== undefined || o.icon) && (
                        <span className={styles.optionIcon}>
                          {o.visual !== undefined
                            ? o.visual
                            : o.icon && <Icon name={o.icon} size="20px" />}
                        </span>
                      )}
                      <span className={styles.optionText}>
                        <span className={styles.optionTitle}>{o.title}</span>
                        {o.subtitle && (
                          <span className={styles.optionSubtitle}>{o.subtitle}</span>
                        )}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className={styles.footer}>
              <button type="button" className={styles.footerBtn} onClick={selectAllVisible}>
                Select all
              </button>
              <button type="button" className={styles.footerBtn} onClick={clearAll}>
                Clear
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
