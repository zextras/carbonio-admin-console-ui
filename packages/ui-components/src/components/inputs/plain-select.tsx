/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { flip, limitShift, offset, shift } from '@floating-ui/dom';
import clsx from 'clsx';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

import { setupFloating } from '../../utils/floating-ui';
import { Portal } from '../utilities/Portal';
import popupStyles from './combobox-input.module.css';
import { InputShell } from './input-shell';
import styles from './input-shell.module.css';
import triggerStyles from './plain-select.module.css';
import type { SelectItem } from './Select';

export type PlainSelectProps<T = string> = {
  /** Always rendered as a visible <label> above the field. */
  label: string;
  /** Options shown in the listbox popup. */
  items: Array<SelectItem<T>>;
  /** Controlled selection. The component is fully controlled by design. */
  selection: SelectItem<T>;
  /** Fired with the picked item's value. */
  onChange: (value: T) => void;
  /** Renders the description below the field and links it via aria-describedby. `null` is treated as absent. */
  description?: string | null;
  /** Marks the field as invalid (aria-invalid) and applies the error styling. */
  hasError?: boolean;
  disabled?: boolean;
  required?: boolean;
};

function selectedIndexOf<T>(items: Array<SelectItem<T>>, selection: SelectItem<T>): number | null {
  const index = items.findIndex((item) => item.value === selection.value);
  return index >= 0 ? index : null;
}

function enabledIndexInDirection<T>(
  items: Array<SelectItem<T>>,
  from: number | null,
  direction: 1 | -1,
): number | null {
  const entries = items.map((item, index) => ({ item, index }));
  if (direction === 1) {
    const start = from === null ? 0 : from + 1;
    return entries.slice(start).find(({ item }) => !item.disabled)?.index ?? null;
  }
  const end = from ?? items.length;
  return entries.slice(0, end).reverse().find(({ item }) => !item.disabled)?.index ?? null;
}

function firstEnabledIndexOf<T>(items: Array<SelectItem<T>>): number | null {
  return items.map((item, index) => ({ item, index })).find(({ item }) => !item.disabled)?.index ?? null;
}

function lastEnabledIndexOf<T>(items: Array<SelectItem<T>>): number | null {
  return (
    items.map((item, index) => ({ item, index })).findLast(({ item }) => !item.disabled)?.index ?? null
  );
}

type PlainSelectOptionProps<T> = {
  item: SelectItem<T>;
  optionId: string;
  active: boolean;
  selected: boolean;
  onPick: (item: SelectItem<T>) => void;
};

function PlainSelectOption<T>({
  item,
  optionId,
  active,
  selected,
  onPick,
}: PlainSelectOptionProps<T>) {
  return (
    <option
      id={optionId}
      aria-selected={selected}
      disabled={item.disabled}
      data-active={active || undefined}
      data-disabled={item.disabled || undefined}
      className={popupStyles.option}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
      onClick={() => {
        if (!item.disabled) onPick(item);
      }}
      onKeyUp={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!item.disabled) onPick(item);
        }
      }}
    >
      {item.customComponent}
      {item.label}
    </option>
  );
}

export const PlainSelect = <T,>({
  label,
  items,
  selection,
  onChange,
  disabled = false,
  required = false,
  description,
  hasError = false,
}: PlainSelectProps<T>) => {
  const triggerId = useId();
  const descriptionId = useId();
  const listboxId = useId();
  const popupRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const resolvedDescription = description ?? '';
  const triggerClassName = clsx(styles.control, triggerStyles.trigger);

  function openList(): void {
    setOpen(true);
    setActiveIndex(selectedIndexOf(items, selection));
  }

  function closeList(): void {
    setOpen(false);
    setActiveIndex(null);
  }

  function pick(item: SelectItem<T>): void {
    closeList();
    onChange(item.value);
  }

  function pickActive(): void {
    const item = items[activeIndex ?? -1];
    if (item && !item.disabled) pick(item);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>): void {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        e.preventDefault();
        const direction = e.key === 'ArrowDown' ? 1 : -1;
        if (!open) {
          openList();
          setActiveIndex(
            direction === 1 ? selectedIndexOf(items, selection) : lastEnabledIndexOf(items),
          );
        } else {
          setActiveIndex((current) => enabledIndexInDirection(items, current, direction));
        }
        break;
      }
      case 'Home':
        e.preventDefault();
        if (!open) setOpen(true);
        setActiveIndex(firstEnabledIndexOf(items));
        break;
      case 'End':
        e.preventDefault();
        if (!open) setOpen(true);
        setActiveIndex(lastEnabledIndexOf(items));
        break;
      case 'Enter':
      case ' ':
        if (open) {
          e.preventDefault();
          pickActive();
        }
        break;
      case 'Escape':
        if (open) {
          e.preventDefault();
          closeList();
        }
        break;
      case 'Tab':
        closeList();
        break;
      default:
        break;
    }
  }

  useLayoutEffect(() => {
    if (!open) return undefined;
    const box = triggerRef.current?.parentElement;
    const popup = popupRef.current;
    if (!box || !popup) return undefined;
    popup.style.width = `${box.offsetWidth}px`;
    return setupFloating(box, popup, {
      placement: 'bottom-start',
      strategy: 'fixed',
      middleware: [offset(4), flip(), shift({ limiter: limitShift() })],
    });
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function handlePointerDown(e: PointerEvent): void {
      const target = e.target as Node;
      const box = triggerRef.current?.parentElement;
      const popup = popupRef.current;
      if (box?.contains(target) || popup?.contains(target)) return;
      closeList();
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  return (
    <InputShell
      id={triggerId}
      label={label}
      disabled={disabled}
      required={required}
      hasError={hasError}
      description={resolvedDescription}
      descriptionId={descriptionId}
    >
      <button
        type="button"
        id={triggerId}
        ref={triggerRef}
        disabled={disabled}
        className={triggerClassName}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        onClick={() => {
          if (open) closeList();
          else openList();
        }}
        onKeyDown={handleKeyDown}
      >
        {selection.label}
      </button>
      <ds-icon
        icon={open ? 'ChevronUp' : 'ChevronDown'}
        size="1rem"
        color="var(--color-gray1-focus)"
        aria-hidden="true"
      />
      {open && !disabled && (
        <Portal show>
          <div ref={popupRef} id={listboxId} className={popupStyles.listbox}>
            <select
              size={Math.max(items.length, 2)}
              data-single={items.length === 1 || undefined}
              className={popupStyles.listboxOptions}
            >
              {items.map((item, index) => (
                <PlainSelectOption<T>
                  key={String(item.value)}
                  item={item}
                  optionId={`${listboxId}-${index}`}
                  active={activeIndex === index}
                  selected={item.value === selection.value}
                  onPick={pick}
                />
              ))}
            </select>
          </div>
        </Portal>
      )}
    </InputShell>
  );
};
