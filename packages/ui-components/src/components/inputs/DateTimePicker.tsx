/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '@daypicker/react/style.css';

import { DayPicker,type Styles } from '@daypicker/react';
import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import { format } from 'date-fns';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { Button, ButtonProps } from '../basic/button/Button';
import { INPUT_BACKGROUND_COLOR } from '../constants';
import { Container, ContainerProps } from '../layout/Container';
import styles from './DateTimePicker.module.css';
import { Input, InputProps } from './Input';

type DateTimePickerProps = {
  /** Close icon to clear Input */
  isClearable?: boolean;
  /** Label for input */
  label: string;
  /** input change callback */
  onChange?: (newValue: Date | null) => void;
  /** Date format using date-fns tokens */
  dateFormat?: string;
  disabled?: boolean;
  width?: ContainerProps['width'];
  minDate?: Date;
  maxDate?: Date;
  /** Controlled selected date */
  selected?: Date | null;
  className?: string;
};

type InputIconsProps = Pick<ButtonProps, 'onClick' | 'disabled'> & {
  showClear: boolean;
  onClear: ButtonProps['onClick'];
};

const buildInputIcons = ({
  showClear,
  onClear,
  onClick,
  disabled,
}: InputIconsProps): NonNullable<InputProps['CustomIcon']> =>
  function InputIcons(): React.JSX.Element {
    return (
      <div className={styles.inputIconsContainer}>
        {showClear && (
          <Button
            icon="CloseOutline"
            size="large"
            onClick={onClear}
            backgroundColor="transparent"
            disabled={disabled}
            className={styles.customButton}
            aria-label="Clear"
          />
        )}
        <Button
          icon="CalendarOutline"
          size="large"
          backgroundColor="transparent"
          onClick={onClick}
          labelColor={'text'}
          disabled={disabled}
          className={styles.customButton}
          aria-label="Calendar"
        />
      </div>
    );
  };

const noopOnChange = (): void => undefined;

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

export const DateTimePicker = ({
  label,
  dateFormat = 'MMMM d, yyyy h:mm aa',
  isClearable = false,
  onChange,
  selected,
  disabled,
  width,
  minDate,
  maxDate,
  className,
}: DateTimePickerProps) => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const inputValue = useMemo(
    () => (selected ? format(selected, dateFormat) : ''),
    [selected, dateFormat],
  );

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
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
      if (popoverRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
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
    (e: React.MouseEvent<HTMLButtonElement> | KeyboardEvent) => {
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

  const InputIconsComponent = useMemo<InputProps['CustomIcon']>(
    () =>
      buildInputIcons({
        showClear: isClearable && !!selected,
        onClear: handleClear,
        onClick: toggleOpen,
        disabled,
      }),
    [isClearable, selected, handleClear, toggleOpen, disabled],
  );

  const disabledMatcher = useMemo(() => {
    const matchers: Array<{ before: Date } | { after: Date }> = [];
    if (minDate) matchers.push({ before: minDate });
    if (maxDate) matchers.push({ after: maxDate });
    return matchers.length > 0 ? matchers : undefined;
  }, [minDate, maxDate]);

  return (
    <Container
      orientation="horizontal"
      height="fit"
      mainAlignment="flex-start"
      className={styles.styler}
    >
      <div ref={anchorRef} className={className}>
        <Container width={width ?? '15.625rem'}>
          <Input
            backgroundColor={INPUT_BACKGROUND_COLOR}
            label={label}
            value={inputValue}
            onChange={noopOnChange}
            CustomIcon={InputIconsComponent}
            disabled={disabled}
          />
        </Container>
      </div>
      <div popover="manual" ref={popoverRef} className={styles.popover} data-open={isOpen || undefined}>
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
    </Container>
  );
};
