/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { flip, limitShift, offset, shift } from '@floating-ui/dom';
import clsx from 'clsx';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

import { setupFloating } from '../../utils/floating-ui';
import type { IconName } from '../../web-components/icon-registry';
import { Portal } from '../utilities/Portal';
import popupStyles from './combobox-input.module.css';
import { InputShell } from './input-shell';
import styles from './input-shell.module.css';

type ComboboxItem = {
  /** Stable identifier; also used as the React key. */
  id: string;
  /** Text shown in the listbox row. */
  label: string;
  /** Renders the option as non-selectable and skips it during keyboard navigation. */
  disabled?: boolean;
  /** Optional leading icon name, rendered as a decorative ds-icon. */
  icon?: IconName;
};

type ComboboxInputProps = Omit<
  React.ComponentPropsWithRef<'input'>,
  'size' | 'onSelect' | 'value' | 'onChange' | 'defaultValue' | 'id'
> & {
  /** Always rendered as a visible <label> above the field. */
  label: string;
  /** Controlled value. The field is fully controlled by design: `value` and `onChange` are required and `defaultValue` is not accepted. */
  value: string | number | readonly string[];
  /** Fired on every keystroke; the caller owns the text. The component never filters and never writes back. */
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  /** Options shown in the listbox. Rendered as given: the component never filters. */
  items: Array<ComboboxItem>;
  /** Renders the description below the field and links it via aria-describedby. `null` is treated as absent. */
  description?: string | null;
  /** Marks the field as invalid (aria-invalid) and applies the error styling. */
  hasError?: boolean;
  /** Fired when the user picks an option (click or Enter). The component never writes the picked label back into the input. */
  onSelect: (item: ComboboxItem) => void;
  /** When provided, renders a clear button while the value is non-empty. */
  onClear?: () => void;
  /** Renders a "Loading..." row instead of the options. */
  loading?: boolean;
  /** Rendered as a non-interactive row when the list is open with no items and not loading. */
  emptyMessage?: string;
};

function optionDomId(listboxId: string, itemId: string): string {
  return `${listboxId}-${itemId.replaceAll(/[^a-zA-Z0-9_-]/g, '_')}`;
}

function selectedIndexOf(items: Array<ComboboxItem>, value: string | undefined): number | null {
  const query = value?.toLowerCase() ?? '';
  const match = items
    .map((item, index) => ({ item, index }))
    .find(({ item }) => !item.disabled && item.label.toLowerCase() === query);
  return match?.index ?? null;
}

function firstEnabledIndexOf(items: Array<ComboboxItem>): number | null {
  return (
    items.map((item, index) => ({ item, index })).find(({ item }) => !item.disabled)?.index ?? null
  );
}

function lastEnabledIndexOf(items: Array<ComboboxItem>): number | null {
  return (
    items.map((item, index) => ({ item, index })).findLast(({ item }) => !item.disabled)?.index ??
    null
  );
}

function nextEnabledIndexOf(
  items: Array<ComboboxItem>,
  from: number | null,
  direction: 1 | -1,
): number | null {
  const entries = items.map((item, index) => ({ item, index }));
  const candidates =
    direction === 1
      ? entries.slice(from === null ? 0 : from + 1)
      : entries.slice(0, from === null ? items.length : from).reverse();
  return candidates.find(({ item }) => !item.disabled)?.index ?? null;
}

type ComboboxKeyAction =
  | { type: 'move'; direction: 1 | -1 }
  | { type: 'jump'; to: 'first' | 'last' }
  | { type: 'pick' }
  | { type: 'close'; preventDefault: boolean }
  | { type: 'passThrough' };

function resolveKeyAction(
  key: string,
  isOpen: boolean,
  hasActiveOption: boolean,
): ComboboxKeyAction {
  switch (key) {
    case 'ArrowDown':
      return { type: 'move', direction: 1 };
    case 'ArrowUp':
      return { type: 'move', direction: -1 };
    case 'Home':
      return { type: 'jump', to: 'first' };
    case 'End':
      return { type: 'jump', to: 'last' };
    case 'Enter':
      if (isOpen && hasActiveOption) return { type: 'pick' };
      if (isOpen) return { type: 'close', preventDefault: true };
      return { type: 'passThrough' };
    case 'Escape':
      return isOpen ? { type: 'close', preventDefault: true } : { type: 'passThrough' };
    case 'Tab':
      return isOpen ? { type: 'close', preventDefault: false } : { type: 'passThrough' };
    default:
      return { type: 'passThrough' };
  }
}

type ComboboxOptionProps = {
  item: ComboboxItem;
  optionId: string;
  active: boolean;
  selected: boolean;
  onPick: (item: ComboboxItem) => void;
};

const ComboboxOption = ({ item, optionId, active, selected, onPick }: ComboboxOptionProps) => (
  <div
    id={optionId}
    role="option"
    tabIndex={-1}
    aria-selected={selected}
    aria-disabled={item.disabled || undefined}
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
    {item.icon && (
      <ds-icon
        icon={item.icon}
        size="0.875rem"
        color="var(--color-text-regular)"
        aria-hidden="true"
      />
    )}
    <span className={popupStyles.optionLabel}>{item.label}</span>
  </div>
);

type ComboboxPopupBodyProps = {
  loading: boolean;
  emptyMessage?: string;
  listboxId: string;
  items: Array<ComboboxItem>;
  activeIndex: number | null;
  valueLower: string | undefined;
  onPick: (item: ComboboxItem) => void;
};

const ComboboxPopupBody = ({
  loading,
  emptyMessage,
  listboxId,
  items,
  activeIndex,
  valueLower,
  onPick,
}: ComboboxPopupBodyProps) => {
  if (loading) {
    return <p className={popupStyles.messageRow}>Loading...</p>;
  }
  if (items.length === 0) {
    return emptyMessage ? <p className={popupStyles.messageRow}>{emptyMessage}</p> : null;
  }
  return (
    <div role="listbox" className={popupStyles.listboxOptions}>
      {items.map((item, index) => (
        <ComboboxOption
          key={item.id}
          item={item}
          optionId={optionDomId(listboxId, item.id)}
          active={activeIndex === index}
          selected={item.label.toLowerCase() === valueLower}
          onPick={onPick}
        />
      ))}
    </div>
  );
};

const ComboboxInput = ({
  label,
  value,
  onChange,
  items,
  disabled,
  required,
  description,
  hasError = false,
  loading = false,
  emptyMessage,
  onSelect,
  onClear,
  className,
  onClick,
  onKeyDown,
  ref: callerRef,
  'aria-describedby': callerDescribedBy,
  ...rest
}: ComboboxInputProps) => {
  const inputId = useId();
  const descriptionId = useId();
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const resolvedDescription = description ?? '';
  const inputClassName = clsx(styles.control, className);
  const describedBy = clsx(callerDescribedBy, description ? descriptionId : undefined);
  const valueLower = value.toString().toLowerCase();

  function openList(): void {
    if (disabled) return;
    setOpen(true);
    setActiveIndex(selectedIndexOf(items, value.toString()));
  }

  function closeList(): void {
    setOpen(false);
    setActiveIndex(null);
  }

  function pick(item: ComboboxItem): void {
    closeList();
    onSelect(item);
  }

  function handleArrow(direction: 1 | -1): void {
    const nextIndex = nextEnabledIndexOf(items, activeIndex, direction);
    if (nextIndex !== null) setActiveIndex(nextIndex);
  }

	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
		const action = resolveKeyAction(e.key, open, activeIndex !== null);
		switch (action.type) {
			case 'move':
				e.preventDefault();
				if (open) {
					handleArrow(action.direction);
				} else {
					setOpen(true);
					setActiveIndex(nextEnabledIndexOf(items, null, action.direction));
				}
				break;
			case 'jump':
				e.preventDefault();
				if (!open) setOpen(true);
				setActiveIndex(
					action.to === 'first' ? firstEnabledIndexOf(items) : lastEnabledIndexOf(items),
				);
				break;
			case 'pick': {
				e.preventDefault();
				const item = items[activeIndex ?? -1];
				if (item && !item.disabled) pick(item);
				break;
			}
			case 'close':
				if (action.preventDefault) e.preventDefault();
				closeList();
				break;
			default:
				break;
		}
		onKeyDown?.(e);
	}

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    if (!open && !disabled) {
      setOpen(true);
      setActiveIndex(selectedIndexOf(items, e.target.value));
    }
    onChange?.(e);
  }

  function handleClick(e: React.MouseEvent<HTMLInputElement>): void {
    if (!open) openList();
    onClick?.(e);
  }

  useLayoutEffect(() => {
    if (!open) return undefined;
    const box = inputRef.current?.parentElement;
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
      const box = inputRef.current?.parentElement;
      const popup = popupRef.current;
      if (box?.contains(target) || popup?.contains(target)) return;
      closeList();
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  const showClear = onClear !== undefined && !!valueLower;

  return (
    <InputShell
      id={inputId}
      label={label}
      disabled={disabled}
      required={required}
      hasError={hasError}
      description={resolvedDescription}
      descriptionId={descriptionId}
    >
      <input
        id={inputId}
        value={value}
        ref={(node: HTMLInputElement | null) => {
          inputRef.current = node;
          if (typeof callerRef === 'function') callerRef(node);
          else if (callerRef) callerRef.current = node;
        }}
        role="combobox"
        disabled={disabled}
        required={required}
        className={inputClassName}
        aria-haspopup="listbox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={
          activeIndex === null ? undefined : optionDomId(listboxId, items[activeIndex]?.id ?? '')
        }
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy || undefined}
        onChange={handleChange}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...rest}
      />
      {showClear && (
        <button
          type="button"
          className={popupStyles.iconButton}
          aria-label="Clear"
          onClick={onClear}
        >
          <ds-icon
            icon="CloseOutline"
            size="1rem"
            color="var(--color-gray1-focus)"
            aria-hidden="true"
          />
        </button>
      )}
      <button
        type="button"
        className={popupStyles.iconButton}
        aria-label="Toggle suggestions"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        disabled={disabled}
        onClick={() => {
          if (open) closeList();
          else openList();
        }}
      >
        <ds-icon
          icon={open ? 'ChevronUp' : 'ChevronDown'}
          size="1rem"
          color="var(--color-gray1-focus)"
          aria-hidden="true"
        />
      </button>
      {open && !disabled && (
        <Portal show>
          <div ref={popupRef} id={listboxId} className={popupStyles.listbox}>
            <ComboboxPopupBody
              loading={loading}
              emptyMessage={emptyMessage}
              listboxId={listboxId}
              items={items}
              activeIndex={activeIndex}
              valueLower={valueLower}
              onPick={pick}
            />
          </div>
        </Portal>
      )}
    </InputShell>
  );
};

export { ComboboxInput };
export type { ComboboxInputProps, ComboboxItem };
