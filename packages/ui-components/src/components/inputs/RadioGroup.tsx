/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useState } from 'react';

import { type RadioValue } from './plain-radio';
import { PlainRadioGroup, type PlainRadioGroupProps } from './plain-radio-group';

type RadioGroupProps<T extends RadioValue = string> = Omit<
  PlainRadioGroupProps,
  'value' | 'onChange'
> & {
  defaultValue?: T;
  /** Controlled value. When omitted the group is uncontrolled and starts from `defaultValue`. */
  value?: T;
  /** Fired when the user selects a different radio. */
  onChange?: (value: T) => void;
  children: React.ReactNode;
};

const RadioGroup = <T extends RadioValue = string>({
  value,
  defaultValue,
  onChange,
  ...rest
}: RadioGroupProps<T>) => {
  const [innerValue, setInnerValue] = useState<RadioValue>(defaultValue);

  return (
    <PlainRadioGroup
      value={value ?? innerValue}
      onChange={(newValue) => {
        if (value === undefined) setInnerValue(newValue);
        onChange?.(newValue as T);
      }}
      {...rest}
    />
  );
};

export { RadioGroup };
export type { RadioGroupProps };
