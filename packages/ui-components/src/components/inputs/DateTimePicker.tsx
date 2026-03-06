/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DatePicker, { type DatePickerProps } from 'react-datepicker';

import { Button, ButtonProps } from '../basic/button/Button';
import { INPUT_BACKGROUND_COLOR } from '../constants';
import { Container, ContainerProps } from '../layout/Container';
import styles from './DateTimePicker.module.css';
import { Input, InputProps } from './Input';

type DateTimePickerProps = Omit<DatePickerProps, 'onChange' | 'placeholderText'> & {
  /** Close icon to clear Input */
  isClearable?: boolean;
  /** Label for input */
  label: string;
  /** input change callback */
  onChange?: (newValue: Date | null) => void;
  /** default value of the input */
  defaultValue?: Date | null;

  includeTime?: boolean;
  /** Date format  */
  dateFormat?: string;
  disabled?: boolean;
};

type DateTimePickerInputProps = Omit<InputProps, 'onChange'> & {
  width: ContainerProps['width'];
  isClearable: boolean;
  onClear: ButtonProps['onClick'];
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

const DateTimePickerInput = ({
  width,
  onClear,
  isClearable,
  ...rest
}: DateTimePickerInputProps & any) => {
  const { value, onClick = (): void => undefined, disabled } = rest;

  const InputIconsComponent = useMemo<InputProps['CustomIcon']>(
    () => buildInputIcons({ showClear: isClearable && !!value, onClear, onClick, disabled }),
    [disabled, isClearable, onClear, onClick, value],
  );

  return (
    <Container width={width}>
      <Input CustomIcon={InputIconsComponent} {...rest} />
    </Container>
  );
};

export const DateTimePicker = ({
  label,
  includeTime = true,
  dateFormat = 'MMMM d, yyyy h:mm aa',
  timeIntervals = 15,
  isClearable = false,
  onChange,
  defaultValue = null,
  disabled,
  ...datePickerProps
}: DateTimePickerProps) => {
  const dateTimeRef = useRef<Date | null>(defaultValue);
  const [dateTime, _setDateTime] = useState(defaultValue);
  const setDateTime = useCallback<
    (
      action:
        | { type: 'SAVE' | 'SAVE_AND_UPDATE'; value: Date | null }
        | { type: 'UPDATE'; value?: never },
    ) => void
  >(
    ({ type, value: newValue }) => {
      const currentValue = dateTimeRef.current;
      switch (type) {
        case 'SAVE':
          dateTimeRef.current = newValue;
          break;
        case 'UPDATE':
          _setDateTime(currentValue);
          onChange?.(currentValue);
          break;
        case 'SAVE_AND_UPDATE':
          dateTimeRef.current = newValue;
          _setDateTime(newValue);
          onChange?.(newValue);
          break;
        default:
          break;
      }
    },
    [onChange],
  );

  useEffect(() => {
    setDateTime({ type: 'SAVE_AND_UPDATE', value: defaultValue });
  }, [defaultValue, setDateTime]);

  const onClear = useCallback(() => {
    setDateTime({ type: 'SAVE_AND_UPDATE', value: null });
  }, [setDateTime]);

  const onValueChange = useCallback(
    (date: any) => {
      // React-datepicker v9 returns Date[] | null, extract first date
      const singleDate = Array.isArray(date) ? date[0] : date;
      setDateTime({ type: 'SAVE', value: singleDate as Date | null });
    },
    [setDateTime],
  );

  const defaultInputComponent = useMemo(() => {
    return (
      <DateTimePickerInput
        backgroundColor={INPUT_BACKGROUND_COLOR}
        description={undefined}
        width={'15.625rem'}
        label={label}
        onClear={onClear}
        isClearable={isClearable}
      />
    );
  }, [isClearable, label, onClear]);

  const updateDateTime = useCallback<NonNullable<DatePickerProps['onCalendarClose']>>(() => {
    setDateTime({ type: 'UPDATE' });
  }, [setDateTime]);

  return (
    <Container
      orientation="horizontal"
      height="fit"
      mainAlignment="flex-start"
      className={styles.styler}
    >
      {/* @ts-expect-error - needs a fix // error is on unused property */}
      <DatePicker
        showPopperArrow={false}
        selected={dateTime}
        onChange={onValueChange}
        showTimeSelect={includeTime}
        timeIntervals={timeIntervals}
        dateFormat={dateFormat}
        disabled={disabled}
        customInput={defaultInputComponent}
        placeholderText={label}
        onCalendarClose={updateDateTime}
        onSelect={updateDateTime}
        onBlur={updateDateTime}
        {...datePickerProps}
      />
    </Container>
  );
};
