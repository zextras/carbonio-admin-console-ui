/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useState } from 'react';

import { getPaddingVar, type PaddingVarObj } from '../../theme/theme-utils';
import { PlainSwitch, type PlainSwitchProps } from './plain-switch';

type SwitchProps = Omit<
  PlainSwitchProps,
  'checked' | 'defaultChecked' | 'value' | 'onChange' | 'onClick' | 'size' | 'ref' | 'rootRef'
> & {
  /** Ref to the root element, so wrappers like Tooltip anchor to the whole switch row. */
  ref?: React.Ref<HTMLDivElement>;
  defaultChecked?: boolean;
  /** Controlled value. When omitted the switch is uncontrolled and starts from `defaultChecked`. */
  value?: boolean;
  label: string;
  /** Outer padding of the switch row. */
  padding?: PaddingVarObj | string | 0;
  disabled?: boolean;
  /** Fired on every user toggle with the native change event. */
  onClick?: (event: Event) => void;
  /** Fired on every user toggle with the new checked state. */
  onChange?: (checked: boolean) => void;
};

const Switch = ({
  defaultChecked = false,
  value,
  label,
  padding,
  disabled = false,
  onClick,
  onChange,
  style,
  ref,
  onKeyDown,
  ...rest
}: SwitchProps) => {
  const [innerChecked, setInnerChecked] = useState(defaultChecked);
  const paddingStyle = padding === undefined ? undefined : { padding: getPaddingVar(padding) };

  return (
    <PlainSwitch
      rootRef={ref}
      label={label}
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

export { Switch };
export type { SwitchProps };
