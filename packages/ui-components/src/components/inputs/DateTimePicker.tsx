/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '@daypicker/react/style.css';

import { DayPicker } from '@daypicker/react';
import { format } from 'date-fns';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import { Button, ButtonProps } from '../basic/button/Button';
import { INPUT_BACKGROUND_COLOR } from '../constants';
import { Popper } from '../display/Popper';
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
        />
      </div>
    );
  };

const noopOnChange = (): void => undefined;

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
  const [isOpen, setIsOpen] = useState(false);

  const inputValue = useMemo(
    () => (selected ? format(selected, dateFormat) : ''),
    [selected, dateFormat],
  );

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

  const closePopper = useCallback(() => {
    setIsOpen(false);
  }, []);

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
      <Popper open={isOpen} anchorEl={anchorRef} placement="bottom-start" onClose={closePopper}>
        <div className={styles.calendar}>
          <DayPicker
            mode="single"
            selected={selected ?? undefined}
            onSelect={handleSelect}
            disabled={disabledMatcher}
            autoFocus
          />
        </div>
      </Popper>
    </Container>
  );
};
