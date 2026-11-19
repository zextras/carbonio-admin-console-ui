/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getPaddingVar, type PaddingVarObj } from '../../theme/theme-utils';
import { PlainRadio, type PlainRadioProps, type RadioValue } from './plain-radio';

type RadioComponentProps<T extends RadioValue> = {
  /** status of the Radio */
  defaultChecked?: boolean;
  /** Radio checked. Ignored inside a RadioGroup, which owns the selection. */
  checked?: boolean;
  /** Radio text */
  label?: React.ReactNode;
  /** whether to disable the radio or not */
  disabled?: boolean;
  /** Fired when the user selects the radio (mouse or keyboard). */
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
  /** Fired when the user selects the radio, with its new checked state. */
  onChange?: (checked: boolean) => void;
  /** Outer padding of the radio row. */
  padding?: PaddingVarObj | string | 0;
  /** Ref for the input element */
  inputRef?: React.Ref<HTMLInputElement>;
  /** Value of the radio input */
  value?: T;
  /** Ref to the root element */
  ref?: React.Ref<HTMLDivElement>;
};

type RadioProps<T extends RadioValue = string> = RadioComponentProps<T> &
  Omit<PlainRadioProps, 'rootRef' | 'size' | keyof RadioComponentProps<T>>;

const Radio = <T extends RadioValue = string>({
  label,
  onClick,
  onChange,
  disabled = false,
  padding,
  inputRef,
  style,
  ref,
  ...rest
}: RadioProps<T>) => {
  const paddingStyle = padding === undefined ? undefined : { padding: getPaddingVar(padding) };

  return (
    <PlainRadio
      {...rest}
      rootRef={ref}
      ref={inputRef}
      label={label}
      disabled={disabled}
      onClick={onClick}
      onChange={(event) => onChange?.(event.target.checked)}
      style={{ ...paddingStyle, ...style }}
    />
  );
};

export { Radio };
export type { RadioProps };
