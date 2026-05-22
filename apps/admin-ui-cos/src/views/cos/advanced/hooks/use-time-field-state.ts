/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SingleSelectionOnChange } from '@zextras/ui-components';
import { ChangeEvent, useCallback, useRef, useState } from 'react';

type UseTimeFieldStateReturn = {
  num: string | undefined;
  type: string | undefined;
  onNumChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onTypeChange: SingleSelectionOnChange;
  reset: (value: string | undefined, defaultType?: string) => void;
};

export function useTimeFieldState(
  onChange: (combinedValue: string) => void,
): UseTimeFieldStateReturn {
  const [num, setNum] = useState<string | undefined>(undefined);
  const [type, setType] = useState<string | undefined>(undefined);

  const numRef = useRef(num);
  numRef.current = num;
  const typeRef = useRef(type);
  typeRef.current = type;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const onNumChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newNum = e.target.value;
    setNum(newNum);
    onChangeRef.current(newNum ? `${newNum}${typeRef.current ?? ''}` : '');
  }, []);

  const onTypeChange = useCallback<SingleSelectionOnChange>((v) => {
    if (v) {
      setType(v);
      onChangeRef.current(numRef.current ? `${numRef.current}${v}` : '');
    }
  }, []);

  const reset = useCallback((value: string | undefined, defaultType = '') => {
    const newNum = value?.slice(0, -1);
    const suffix = value?.slice(-1);
    const newType = suffix ? suffix : defaultType;
    setNum(newNum);
    setType(newType);
  }, []);

  return { num, type, onNumChange, onTypeChange, reset };
}
