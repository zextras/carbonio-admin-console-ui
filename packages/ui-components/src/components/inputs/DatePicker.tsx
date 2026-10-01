/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '@daypicker/react/style.css';

import { DayPicker, type Styles } from '@daypicker/react';
import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import { format } from 'date-fns';
import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';

import popupStyles from './combobox-input.module.css';
import styles from './DatePicker.module.css';
import { InputShell } from './input-shell';
import shellStyles from './input-shell.module.css';

type DatePickerProps = {
  /** Close icon to clear Input */
  isClearable?: boolean;
  /** Label for input */
  label: string;
  /** input change callback */
  onChange?: (newValue: Date | null) => void;
  /** Date format using date-fns tokens */
  dateFormat?: string;
  disabled?: boolean;
  /** Width of the field; defaults to 15.625rem */
  width?: React.CSSProperties['width'];
  minDate?: Date;
  maxDate?: Date;
  /** Controlled selected date */
  selected?: Date | null;
  /** Renders the description below the field and links it via aria-describedby. `null` is treated as absent. */
  description?: string | null;
  /** Marks the field as invalid (aria-invalid) and applies the error styling. */
  hasError?: boolean;
  required?: boolean;
};

function closeOnEscape(
  e: React.KeyboardEvent<HTMLElement>,
  isOpen: boolean,
  close: () => void,
): void {
  if (e.key === 'Escape' && isOpen) {
    e.preventDefault();
    close();
  }
}

const dayPickerStyles: Partial<Styles> = {
  month_caption: {
    width: '100%',
    height: 'var(--rdp-nav-height)',
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'var(--color-gray5-regular)',
    borderBottom: '1px solid var(--color-gray3-regular)',
    boxSizing: 'border-box',
  },
  dropdowns: {
    gap: '0.25rem',
  },
  dropdown_root: {
    cursor: 'pointer',
  },
  caption_label: {
    color: 'var(--color-text-regular)',
    fontWeight: 'var(--font-weight-medium)',
    fontSize: 'var(--font-size-small)',
  },
  button_previous: { zIndex: 1 },
  button_next: { zIndex: 1 },
  month_grid: { margin: '0.5rem' },
  weekday: {
    color: 'var(--color-text-regular)',
    fontWeight: 'var(--font-weight-medium)',
    opacity: 1,
  },
  selected: {
    fontSize: 'inherit',
    fontWeight: 'var(--font-weight-medium)',
  },
  chevron: { fill: 'var(--color-text-regular)' },
};

export const DatePicker = ({
  label,
  dateFormat = 'MMMM d, yyyy h:mm aa',
  isClearable = false,
  onChange,
  selected,
  disabled = false,
  width,
  minDate,
  maxDate,
  description,
  hasError = false,
  required = false,
}: DatePickerProps) => {
  const inputId = useId();
  const descriptionId = useId();
  const popoverId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const inputValue = useMemo(
    () => (selected ? format(selected, dateFormat) : ''),
    [selected, dateFormat],
  );

  const showClear = isClearable && !!selected;

  const closePopover = useCallback(() => {
    setIsOpen(false);
  }, []);

  useLayoutEffect(() => {
    const anchor = inputRef.current?.parentElement;
    const popover = popoverRef.current;
    if (!anchor || !popover) return;

    if (!isOpen) {
      popover.hidePopover();
      return;
    }

    popover.showPopover();

    return autoUpdate(anchor, popover, () => {
      computePosition(anchor, popover, {
        placement: 'bottom-start',
        middleware: [offset(8), flip({ fallbackPlacements: ['bottom', 'top'] }), shift()],
      }).then(({ x, y }) => {
        popover.style.left = `${x}px`;
        popover.style.top = `${y}px`;
      });
    });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent): void => {
      const target = e.target as Node;
      if (popoverRef.current?.contains(target) || inputRef.current?.parentElement?.contains(target))
        return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = useCallback(
    (date: Date | undefined) => {
      onChange?.(date ?? null);
      setIsOpen(false);
    },
    [onChange],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onChange?.(null);
    },
    [onChange],
  );

  const toggleOpen = useCallback(() => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  }, [disabled]);

  const openPopover = useCallback(() => {
    if (!disabled) setIsOpen(true);
  }, [disabled]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>): void => {
      closeOnEscape(e, isOpen, closePopover);
      if (isOpen) return;
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        openPopover();
      }
    },
    [isOpen, closePopover, openPopover],
  );

  const handleCalendarKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>): void => {
      closeOnEscape(e, isOpen, closePopover);
    },
    [isOpen, closePopover],
  );

  const disabledMatcher = useMemo(() => {
    const matchers: Array<{ before: Date } | { after: Date }> = [];
    if (minDate) matchers.push({ before: minDate });
    if (maxDate) matchers.push({ after: maxDate });
    return matchers.length > 0 ? matchers : undefined;
  }, [minDate, maxDate]);

  const expandedAttrs = {
    'aria-haspopup': 'dialog',
    'aria-expanded': isOpen,
    'aria-controls': isOpen ? popoverId : undefined,
  } as const;

  return (
    <div style={{ width: width ?? '15.625rem' }}>
      <InputShell
        id={inputId}
        label={label}
        disabled={disabled}
        required={required}
        hasError={hasError}
        description={description ?? ''}
        descriptionId={descriptionId}
      >
        <input
          id={inputId}
          ref={inputRef}
          className={shellStyles.control}
          value={inputValue}
          readOnly
          disabled={disabled}
          required={required}
          aria-invalid={hasError || undefined}
          aria-describedby={description ? descriptionId : undefined}
          {...expandedAttrs}
          onKeyDown={handleInputKeyDown}
        />
        {showClear && (
          <button
            type="button"
            className={popupStyles.iconButton}
            aria-label="Clear"
            disabled={disabled}
            onClick={handleClear}
          >
            <ds-icon
              icon="CloseOutline"
              size="1rem"
              color="var(--color-gray0-regular)"
              aria-hidden="true"
            />
          </button>
        )}
        <button
          type="button"
          className={popupStyles.iconButton}
          aria-label="Calendar"
          {...expandedAttrs}
          disabled={disabled}
          onClick={toggleOpen}
          onKeyDown={handleCalendarKeyDown}
        >
          <ds-icon
            icon="CalendarOutline"
            size="1rem"
            color="var(--color-gray1-focus)"
            aria-hidden="true"
          />
        </button>
      </InputShell>
      <div
        popover="manual"
        id={popoverId}
        ref={popoverRef}
        className={styles.popover}
        data-open={isOpen || undefined}
        onKeyDown={(e) => {
          closeOnEscape(e, isOpen, closePopover);
        }}
      >
        <DayPicker
          mode="single"
          captionLayout="dropdown"
          navLayout="around"
          reverseYears
          startMonth={minDate ?? new Date(2020, 0)}
          endMonth={maxDate ?? new Date(2050, 11)}
          selected={selected ?? undefined}
          onSelect={handleSelect}
          disabled={disabledMatcher}
          styles={dayPickerStyles}
          autoFocus
        />
      </div>
    </div>
  );
};
