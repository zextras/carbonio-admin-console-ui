/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SingleSelectionOnChange } from '@zextras/ui-components';
import { ChangeEvent, useState } from 'react';

export type TimeFieldState = {
  num: string | undefined;
  type: string | undefined;
  onNumChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onTypeChange: SingleSelectionOnChange;
  reset: (value: string | undefined, defaultType?: string) => void;
};

export function useTimeFieldState(onChange: (combinedValue: string) => void): TimeFieldState {
  const [num, setNum] = useState<string | undefined>(undefined);
  const [type, setType] = useState<string | undefined>(undefined);

  const onNumChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newNum = e.target.value;
    setNum(newNum);
    onChange(newNum ? `${newNum}${type ?? ''}` : '');
  };

  const onTypeChange: SingleSelectionOnChange = (typedValue) => {
    if (typedValue) {
      setType(typedValue);
      onChange(num ? `${num}${typedValue}` : '');
    }
  };
  const reset = (value: string | undefined, defaultType = '') => {
    const newNum = value?.slice(0, -1);
    const suffix = value?.slice(-1);
    const hasSuffix = suffix !== undefined && suffix !== '';
    const newType = hasSuffix ? suffix : defaultType;
    setNum(newNum);
    setType(newType);
  };

  return { num, type, onNumChange, onTypeChange, reset };
}
