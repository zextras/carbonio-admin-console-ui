/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useState } from 'react';

import { getPaddingVar, type PaddingVarObj } from '../../theme/theme-utils';
import { PlainCheckbox, type PlainCheckboxProps } from './plain-checkbox';

export type CheckboxProps = Omit<
  PlainCheckboxProps,
  'checked' | 'defaultChecked' | 'value' | 'onChange' | 'onClick' | 'size' | 'ref' | 'rootRef'
> & {
  /** Ref to the root element, so wrappers like Tooltip anchor to the whole checkbox row. */
  ref?: React.Ref<HTMLDivElement>;
  /** status of the Checkbox */
  defaultChecked?: boolean;
  /** Controlled value. When omitted the checkbox is uncontrolled and starts from `defaultChecked`. */
  value?: boolean;
  /** Outer padding of the checkbox row. */
  padding?: PaddingVarObj | string | 0;
  /** whether to disable the checkbox or not */
  disabled?: boolean;
  /** Fired on every user toggle with the native change event. */
  onClick?: (event: Event) => void;
  /** Fired on every user toggle with the new checked state. */
  onChange?: (checked: boolean) => void;
};

export const Checkbox = ({
  defaultChecked = false,
  value,
  padding,
  disabled = false,
  onClick,
  onChange,
  style,
  ref,
  onKeyDown,
  ...rest
}: CheckboxProps) => {
  const [innerChecked, setInnerChecked] = useState(defaultChecked);
  const paddingStyle = padding === undefined ? undefined : { padding: getPaddingVar(padding) };

  return (
    <PlainCheckbox
      rootRef={ref}
      disabled={disabled}
      checked={value ?? innerChecked}
      onChange={(event) => {
        if (value === undefined) setInnerChecked(event.target.checked);
        onClick?.(event.nativeEvent);
        onChange?.(event.target.checked);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.key === 'Enter' && !event.defaultPrevented) {
          event.preventDefault();
          event.currentTarget.click();
        }
      }}
      style={{ ...paddingStyle, ...style }}
      {...rest}
    />
  );
};
