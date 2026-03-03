/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { InputHTMLAttributes, useCallback, useEffect, useMemo, useState } from 'react';

import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { resolveThemeColor } from '../../theme/theme-utils';
import { AnyColor } from '../../types/utils';
import { Container, ContainerProps } from '../layout/Container';
import styles from './Radio.module.css';

const RADIO_SIZE: Record<'small' | 'medium', { icon: string; label: string }> = {
  medium: {
    icon: '1.5rem',
    label: 'var(--font-size-medium)',
  },
  small: {
    icon: '1rem',
    label: 'var(--font-size-small)',
  },
};

type RadioInputHTMLAttributes = InputHTMLAttributes<HTMLInputElement> & { type: 'radio' };

type RadioComponentProps<T extends RadioInputHTMLAttributes['value']> = {
  /** status of the Radio */
  defaultChecked?: boolean;
  /** Radio checked */
  checked?: boolean;
  /** Radio text */
  label?: string | React.ReactElement;
  /** whether to disable the radio or not */
  disabled?: boolean;
  /** click callback */
  onClick?: (e: React.MouseEvent<HTMLInputElement> | KeyboardEvent) => void;
  /** change callback */
  onChange?: (checked: boolean) => void;
  /** radio padding */
  padding?: ContainerProps['padding'];
  /** available sizes */
  size?: keyof typeof RADIO_SIZE;
  /** icon color */
  iconColor?: AnyColor;
  /** Ref for the input element */
  inputRef?: React.Ref<HTMLInputElement>;
  /** Value of the radio input */
  value?: T;
};

type RadioProps<T extends RadioInputHTMLAttributes['value'] = string> = RadioComponentProps<T> &
  Omit<RadioInputHTMLAttributes, 'type' | 'checked' | 'id' | keyof RadioComponentProps<T>>;

type RadioType = (<T extends RadioInputHTMLAttributes['value'] = string>(
  p: RadioProps<T> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement<RadioProps> | null) & {
  _id?: number;
};

const RadioComponent = (
  {
    defaultChecked,
    checked,
    label,
    onClick,
    onChange,
    disabled = false,
    padding = { bottom: 'small' },
    size = 'medium',
    iconColor = 'gray0',
    inputRef = null,
    ...rest
  }: RadioProps,
  ref: React.Ref<HTMLDivElement>,
) => {
  const containerRef = useCombinedRefs<HTMLDivElement>(ref);
  const radioInputRef = useCombinedRefs<HTMLInputElement>(inputRef);
  const [isChecked, setIsChecked] = useState(checked ?? defaultChecked ?? false);
  const id = useMemo<string>(() => {
    const RadioComponentAlias = RadioComponent as RadioType;
    if (RadioComponentAlias._id === undefined) {
      RadioComponentAlias._id = 0;
    }
    const { _id } = RadioComponentAlias;
    RadioComponentAlias._id += 1;
    return `Radio-${_id}`;
  }, []);

  const uncontrolledMode = useMemo(() => typeof checked === 'undefined', [checked]);

  const onClickHandler = useCallback<React.MouseEventHandler<HTMLInputElement>>(
    (e) => {
      if (!disabled) {
        if (uncontrolledMode && !e.defaultPrevented) {
          setIsChecked((prevState) => !prevState);
        }
        onClick?.(e);
      }
    },
    [disabled, onClick, uncontrolledMode],
  );

  const onChangeHandler = useCallback<React.ChangeEventHandler<HTMLInputElement>>(() => {
    // do nothing
    // TODO: CDS-174: update state here and not in the click. In controlled mode, do not update the internal state,
    // 	just call the external onChange
  }, []);

  useEffect(() => {
    // TODO: CDS-174: remove this effect, call onChange only from the handler
    onChange?.(isChecked);
  }, [onChange, isChecked]);

  useEffect(() => {
    if (checked !== undefined) {
      setIsChecked(checked);
    }
  }, [checked]);

  const radioSize = RADIO_SIZE[size].icon;

  const inputStyle = {
    '--radio-size': radioSize,
    '--radio-outer-diameter': `calc(${radioSize} * (20 / 24))`,
    '--radio-inner-diameter': `calc(${radioSize} * (10 / 24))`,
    '--radio-border-width': `calc(${radioSize} * (2 / 24))`,
    '--radio-padding': `calc(${radioSize} * (3 / 24))`,
    '--radio-color': resolveThemeColor(iconColor, 'regular'),
    '--radio-color-hover': resolveThemeColor(iconColor, 'hover'),
    '--radio-color-focus': resolveThemeColor(iconColor, 'focus'),
    '--radio-color-active': resolveThemeColor(iconColor, 'active'),
    '--radio-color-disabled': resolveThemeColor(iconColor, 'disabled'),
    '--radio-bg-color': resolveThemeColor('gray6', 'regular'),
  } as React.CSSProperties;

  const labelWithClick = useMemo(
    () =>
      (typeof label === 'string' && (
        <label
          className={`${styles.label} ${disabled ? styles.labelDisabled : ''}`}
          htmlFor={id}
          style={{ '--label-font-size': RADIO_SIZE[size].label } as React.CSSProperties}
        >
          {label}
        </label>
      )) ||
      (React.isValidElement<{ onClick?: React.MouseEventHandler }>(label) &&
        React.cloneElement(label, {
          onClick: (event: React.MouseEvent) => {
            label.props?.onClick?.(event);
            if (!event.defaultPrevented && radioInputRef.current) {
              radioInputRef.current.click();
            }
          },
        })) ||
      label,
    [disabled, id, label, radioInputRef, size],
  );

  const containerClassName = `${styles.radioContainer} ${
    disabled ? styles.radioContainerDisabled : ''
  }`;

  return (
    <Container
      ref={containerRef}
      className={containerClassName}
      width="100%"
      height="auto"
      mainAlignment="flex-start"
      crossAlignment="center"
      orientation="horizontal"
      padding={padding}
      gap={'0.5rem'}
    >
      <input
        type="radio"
        {...rest}
        id={id}
        ref={radioInputRef}
        checked={isChecked}
        onClick={onClickHandler}
        onChange={onChangeHandler}
        disabled={disabled}
        className={styles.radioInput}
        style={inputStyle}
      />
      {labelWithClick}
    </Container>
  );
};

const Radio = RadioComponent as RadioType;

export { Radio, RadioComponent };
export type { RadioProps };
