/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../web-components/divider-wc';

import { useCallback, useMemo, useState } from 'react';

import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { KeyboardPresetObj, useKeyboard } from '../../hooks/useKeyboard';
import { resolveThemeColor } from '../../theme/theme-utils';
import { AnyColor } from '../../types/utils';
import { INPUT_BACKGROUND_COLOR, INPUT_DIVIDER_COLOR } from '../constants';
import { Container, ContainerProps } from '../layout/Container';
import { InputContainer } from './commons/InputContainer';
import { InputDescription } from './commons/InputDescription';
import styles from './Input.module.css';

type InputProps = ContainerProps & {
  backgroundColor?: AnyColor;
  disabled?: boolean;
  textColor?: AnyColor;
  borderColor?: AnyColor;
  label?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef?: React.RefObject<HTMLInputElement> | null;
  value?: string | number;
  defaultValue?: string | number;
  hasError?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  isRequired?: boolean;
  inputName?: string;
  CustomIcon?: React.ComponentType<{ hasError: boolean; hasFocus: boolean; disabled: boolean }>;
  type?: string;
  hideBorder?: boolean;
  onEnter?: (e: KeyboardEvent) => void;
  description?: string;
  trimOnPaste?: boolean;
  ref?: React.Ref<HTMLDivElement>;
};

type Input = React.Ref<InputProps & React.RefAttributes<HTMLDivElement>> & {
  _newId?: number;
};

const Input = ({
  autoFocus = false,
  autoComplete = 'off',
  borderColor = INPUT_DIVIDER_COLOR,
  backgroundColor = INPUT_BACKGROUND_COLOR,
  defaultValue,
  isRequired = false,
  disabled = false,
  textColor = 'text',
  label,
  inputRef = null,
  value,
  CustomIcon,
  onChange,
  hasError = false,
  inputName,
  type = 'text',
  hideBorder = false,
  onEnter,
  description,
  trimOnPaste = false,
  ref,
  ...rest
}: InputProps) => {
  const [hasFocus, setHasFocus] = useState(false);
  const innerRef = useCombinedRefs<HTMLInputElement>(inputRef);
  const [id] = useState(() => {
    if (!Input._newId) {
      Input._newId = 0;
    }

    return `input-${Input._newId++}`;
  });

  const onInputFocus = useCallback(() => {
    if (!disabled && innerRef?.current) {
      setHasFocus(true);
      innerRef.current.focus();
    }
  }, [innerRef, disabled]);

  const onInputBlur = useCallback(() => {
    setHasFocus(false);
  }, []);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (!trimOnPaste) return;
      e.preventDefault();
      const pastedText = e.clipboardData.getData('text').trim();
      const input = e.currentTarget;
      input.value = pastedText;
      onChange({ target: input, currentTarget: input } as React.ChangeEvent<HTMLInputElement>);
    },
    [trimOnPaste, onChange],
  );

  const keyboardEvents = useMemo<KeyboardPresetObj[]>(() => {
    const events: KeyboardPresetObj[] = [];
    if (onEnter) {
      events.push({
        type: 'keyup',
        callback: onEnter,
        keys: [{ key: 'Enter', ctrlKey: false }],
        haveToPreventDefault: true,
      });
    }
    return events;
  }, [onEnter]);

  useKeyboard(innerRef, keyboardEvents);

  const dividerColor = useMemo<AnyColor>(
    () =>
      `${
        (hideBorder && 'transparent') ||
        (hasError && 'error') ||
        (hasFocus && 'primary') ||
        borderColor
      }${disabled ? '.disabled' : ''}`,
    [borderColor, disabled, hasError, hasFocus, hideBorder],
  );

  const labelColor = useMemo(() => {
    const color = (hasError && 'error') || (hasFocus && 'primary') || 'secondary';
    return resolveThemeColor(color, disabled ? 'disabled' : 'regular');
  }, [hasError, hasFocus, disabled]);

  const inputColor = useMemo<React.CSSProperties>(
    () =>
      ({
        '--input-color': resolveThemeColor(String(textColor), 'regular'),
        '--input-color-disabled': resolveThemeColor(String(textColor), 'disabled'),
        '--label-color': labelColor,
      } as React.CSSProperties),
    [textColor, labelColor],
  );

  return (
    <Container height="fit" width="fill" crossAlignment="flex-start">
      <InputContainer
        ref={ref}
        orientation="horizontal"
        width="fill"
        height="fit"
        crossAlignment={'center'}
        borderRadius="half"
        background={backgroundColor}
        onClick={onInputFocus}
        $disabled={disabled}
        padding={{ horizontal: '0.75rem' }}
        gap={'0.5rem'}
        {...rest}
      >
        <Container
          className={styles.relativeContainer}
          style={inputColor}
          padding={{ vertical: label ? '0.0625rem' : '0.625rem' }}
          mainAlignment={'flex-end'}
          height={'fill'}
          width={'fill'}
          minHeight={'inherit'}
        >
          <input
            className={styles.input}
            autoFocus={autoFocus || undefined}
            autoComplete={autoComplete || 'off'}
            ref={innerRef}
            type={type}
            onFocus={onInputFocus}
            required={isRequired}
            aria-required={isRequired}
            onBlur={onInputBlur}
            id={id}
            name={inputName ?? label}
            defaultValue={defaultValue}
            value={value}
            onChange={onChange}
            onPaste={handlePaste}
            disabled={disabled}
            placeholder={label}
          />
          {label && (
            <label htmlFor={id} className={styles.label}>
              {label}
            </label>
          )}
        </Container>
        {CustomIcon && (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <CustomIcon hasError={hasError} hasFocus={hasFocus} disabled={disabled} />
          </span>
        )}
      </InputContainer>
      <divider-wc color={dividerColor}></divider-wc>
      {description !== undefined && (
        <InputDescription
          color={(hasError && 'error') || (hasFocus && 'primary') || 'secondary'}
          disabled={disabled}
        >
          {description}
        </InputDescription>
      )}
    </Container>
  );
};

Input._newId = 0;

export { Input };
export type { InputProps };
