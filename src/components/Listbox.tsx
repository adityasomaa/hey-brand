"use client";

/**
 * ============================================================================
 * Select-only combobox — a real ARIA listbox, not a styled <select>.
 * ============================================================================
 *
 * Implements the WAI-ARIA select-only combobox pattern in full:
 *
 *   ArrowDown / ArrowUp   open the list, then move the active option
 *   Alt+ArrowDown         open without moving
 *   Home / End            first / last option
 *   PageUp / PageDown     jump ten options
 *   Enter                 open, or commit the active option and close
 *   Space                 open, or commit the active option and close
 *   Escape                close without committing
 *   Tab                   commit the active option and move on
 *   printable characters  type-ahead, with a 700ms buffer, wrapping from the
 *                         current position so repeated presses of one letter
 *                         cycle through matches
 *
 * Focus never leaves the trigger: the active option is communicated with
 * aria-activedescendant, which is what "focus returns to the trigger" means in
 * this pattern — it was never taken away in the first place. Clicking an option
 * also returns focus to the trigger explicitly, for pointer users.
 *
 * A hidden input carries the value, so the server action receives it in
 * FormData exactly as a native select would submit it.
 */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

export type ListboxOption = { value: string; label: string; hint?: string };

type ListboxProps = {
  name: string;
  label: string;
  options: ListboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  describedBy?: string;
  required?: boolean;
};

const TYPEAHEAD_RESET_MS = 700;

export function Listbox({
  name,
  label,
  options,
  value,
  onChange,
  placeholder = "Pilih salah satu",
  error,
  describedBy,
  required,
}: ListboxProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, options.findIndex((o) => o.value === value))
  );

  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const searchRef = useRef("");
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const baseId = useId();
  const labelId = `${baseId}-label`;
  const listId = `${baseId}-list`;
  const errorId = `${baseId}-error`;
  const optionId = (i: number) => `${baseId}-opt-${i}`;

  const selected = options.find((o) => o.value === value);

  /* --- open / close ------------------------------------------------------ */
  const openList = useCallback(
    (index?: number) => {
      const start =
        index ?? Math.max(0, options.findIndex((o) => o.value === value));
      setActiveIndex(start);
      setOpen(true);
    },
    [options, value]
  );

  const closeList = useCallback((focusTrigger = true) => {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  }, []);

  const commit = useCallback(
    (index: number) => {
      const option = options[index];
      if (!option) return;
      onChange(option.value);
      setActiveIndex(index);
      setOpen(false);
    },
    [onChange, options]
  );

  /* --- outside click ----------------------------------------------------- */
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  /* --- keep the active option in view ------------------------------------ */
  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.querySelector<HTMLElement>(
      `#${CSS.escape(optionId(activeIndex))}`
    );
    node?.scrollIntoView({ block: "nearest" });
    // optionId is stable for a given baseId.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeIndex]);

  useEffect(
    () => () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    },
    []
  );

  /* --- type-ahead -------------------------------------------------------- */
  const typeAhead = useCallback(
    (char: string) => {
      searchRef.current += char.toLowerCase();
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      searchTimerRef.current = setTimeout(() => {
        searchRef.current = "";
      }, TYPEAHEAD_RESET_MS);

      const query = searchRef.current;
      // Repeating one character cycles through options starting with it.
      const allSame = query.length > 1 && [...query].every((c) => c === query[0]);
      const needle = allSame ? query[0] : query;
      const from = allSame ? activeIndex + 1 : activeIndex;

      for (let step = 0; step < options.length; step++) {
        const i = (from + step) % options.length;
        if (options[i].label.toLowerCase().startsWith(needle)) {
          setActiveIndex(i);
          if (!open) commit(i);
          return;
        }
      }
    },
    [activeIndex, commit, open, options]
  );

  /* --- keyboard ---------------------------------------------------------- */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const { key, altKey } = event;
    const last = options.length - 1;

    if (key === "ArrowDown") {
      event.preventDefault();
      if (!open) openList(altKey ? undefined : Math.min(activeIndex, last));
      else setActiveIndex((i) => Math.min(i + 1, last));
      return;
    }
    if (key === "ArrowUp") {
      event.preventDefault();
      if (!open) openList();
      else setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (key === "Home") {
      event.preventDefault();
      if (!open) openList(0);
      else setActiveIndex(0);
      return;
    }
    if (key === "End") {
      event.preventDefault();
      if (!open) openList(last);
      else setActiveIndex(last);
      return;
    }
    if (key === "PageDown") {
      event.preventDefault();
      if (open) setActiveIndex((i) => Math.min(i + 10, last));
      return;
    }
    if (key === "PageUp") {
      event.preventDefault();
      if (open) setActiveIndex((i) => Math.max(i - 10, 0));
      return;
    }
    if (key === "Enter" || key === " " || key === "Spacebar") {
      event.preventDefault();
      if (!open) openList();
      else commit(activeIndex);
      return;
    }
    if (key === "Escape") {
      if (open) {
        event.preventDefault();
        closeList();
      }
      return;
    }
    if (key === "Tab") {
      // Commit before leaving, matching native select behaviour.
      if (open) commit(activeIndex);
      return;
    }
    if (key.length === 1 && !event.ctrlKey && !event.metaKey && !altKey) {
      event.preventDefault();
      typeAhead(key);
    }
  };

  return (
    <div ref={rootRef} className="listbox-root">
      <span className="field-label" id={labelId}>
        {label}
      </span>

      <div
        ref={triggerRef}
        role="combobox"
        tabIndex={0}
        aria-controls={listId}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-labelledby={labelId}
        aria-required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [error ? errorId : null, describedBy].filter(Boolean).join(" ") || undefined
        }
        aria-activedescendant={open ? optionId(activeIndex) : undefined}
        className="field-input listbox-trigger"
        data-placeholder={selected ? undefined : "true"}
        onKeyDown={onKeyDown}
        onClick={() => (open ? setOpen(false) : openList())}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 12 8"
          className="listbox-caret"
          data-open={open ? "true" : "false"}
        >
          <path
            d="M1 1.5 6 6.5 11 1.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        aria-labelledby={labelId}
        className="listbox-list"
        data-open={open ? "true" : "false"}
        tabIndex={-1}
      >
        {options.map((option, i) => (
          <li
            key={option.value}
            id={optionId(i)}
            role="option"
            aria-selected={option.value === value}
            data-active={i === activeIndex ? "true" : "false"}
            className="listbox-option"
            // pointerdown, not click: the outside-click handler also listens on
            // pointerdown, and click would fire after the list had closed.
            onPointerDown={(event) => {
              event.preventDefault();
              commit(i);
              triggerRef.current?.focus();
            }}
            onPointerEnter={() => setActiveIndex(i)}
          >
            <span>{option.label}</span>
            {option.hint ? (
              <span className="listbox-hint">{option.hint}</span>
            ) : null}
          </li>
        ))}
      </ul>

      {/* Carries the value into FormData for the server action. */}
      <input type="hidden" name={name} value={value} />

      {error ? (
        <span className="field-error" id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
