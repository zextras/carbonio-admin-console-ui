/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import clsx from 'clsx';
import { useCallback, useMemo, useState } from 'react';

import { resolveThemeColor } from '../../theme/theme-utils';
import { Container } from '../layout/Container';
import styles from './custom-text-area.module.css';

type TextareaProps = {
  backgroundColor?: string;
  disabled?: boolean;
  label: string;
  onChange?: (e: any) => void;
  value?: string | number;
  defaultValue?: string | number;
  hasError?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  inputName?: string;
  onEnter?: (e: KeyboardEvent) => void;
  rows?: number;
  ref?: React.Ref<HTMLDivElement>;
};

type CustomTextAreaType = React.FC<TextareaProps> & {
  _newId?: number;
};

const CustomTextArea: CustomTextAreaType = ({
  autoFocus = false,
  autoComplete = 'off',
  backgroundColor = 'gray6',
  defaultValue,
  disabled = false,
  label,
  value,
  onChange,
  hasError = false,
  inputName,
  rows = 3,
  ref,
  ...rest
}) => {
  const [hasFocus, setHasFocus] = useState(false);
  const [id] = useState(() => {
    if (!CustomTextArea._newId) {
      CustomTextArea._newId = 0;
    }

    return `textarea-${CustomTextArea._newId++}`;
  });

  const onTextAreaFocus = useCallback(() => {
    if (!disabled) {
      setHasFocus(true);
    }
  }, [disabled]);

  const onTextAreaBlur = useCallback(() => setHasFocus(false), []);

  const containerStyle = useMemo<React.CSSProperties>(
    () =>
      ({
        '--container-bg': resolveThemeColor(backgroundColor, 'regular'),
        '--container-bg-hover': resolveThemeColor(backgroundColor, 'hover'),
        '--container-bg-focus': resolveThemeColor(backgroundColor, 'focus'),
        '--container-bg-active': resolveThemeColor(backgroundColor, 'active'),
        '--label-color': resolveThemeColor(
          (hasError && 'error') || (hasFocus && 'primary') || 'secondary',
          'regular',
        ),
      } as React.CSSProperties),
    [backgroundColor, hasError, hasFocus],
  );

  return (
    <Container
      ref={ref}
      className={clsx(styles.container, disabled && styles.disabled)}
      style={containerStyle}
      orientation="horizontal"
      width="fill"
      height="fit"
      borderRadius="half"
      onClick={onTextAreaFocus}
      {...rest}
    >
      <textarea
        className={styles.textarea}
        autoFocus={autoFocus || undefined}
        autoComplete={autoComplete || 'off'}
        onFocus={onTextAreaFocus}
        onBlur={onTextAreaBlur}
        id={id}
        name={inputName || label}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={label}
        rows={rows}
      />
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
    </Container>
  );
};

CustomTextArea._newId = 0;

export { CustomTextArea };
export type { TextareaProps };
