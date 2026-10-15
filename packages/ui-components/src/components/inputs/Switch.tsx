/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getPaddingVar, type PaddingVarObj } from '../../theme/theme-utils';
import { PlainSwitch, type PlainSwitchProps } from './plain-switch';

type SwitchSize = 'medium' | 'small';

type SwitchProps = Omit<
  PlainSwitchProps,
  'checked' | 'defaultChecked' | 'value' | 'onChange' | 'onClick' | 'size'
> & {
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
  /** @deprecated The new switch has a single size; this prop is ignored. */
  size?: SwitchSize;
  /** @deprecated The new switch uses the design-system colors; this prop is ignored. */
  iconColor?: string;
  /** @deprecated `label` is now required and is the accessible name; this prop is ignored. */
  iconAriaLabel?: string;
};

const Switch = ({
  defaultChecked = false,
  value,
  label,
  padding,
  disabled = false,
  onClick,
  onChange,
  size: _size,
  iconColor: _iconColor,
  iconAriaLabel: _iconAriaLabel,
  style,
  ...rest
}: SwitchProps) => {
  const paddingStyle = padding === undefined ? undefined : { padding: getPaddingVar(padding) };

  return (
    <PlainSwitch
      label={label}
      disabled={disabled}
      checked={value}
      defaultChecked={value === undefined ? defaultChecked : undefined}
      onChange={(event) => {
        onClick?.(event.nativeEvent);
        onChange?.(event.target.checked);
      }}
      style={{ ...paddingStyle, ...style }}
      {...rest}
    />
  );
};

export { Switch };
export type { SwitchProps };
