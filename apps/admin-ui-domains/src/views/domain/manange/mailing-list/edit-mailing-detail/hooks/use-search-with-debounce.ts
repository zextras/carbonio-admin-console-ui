/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { debounce } from 'lodash';
import { useCallback, useEffect, useRef } from 'react';

export function useSearchWithDebounce(
  searchValue: string,
  searchFn: (value: string) => void,
  delay = 700,
): void {
  const searchFnRef = useRef(searchFn);
  searchFnRef.current = searchFn;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      searchFnRef.current(value);
    }, delay),
    [delay],
  );

  useEffect(() => {
    if (searchValue !== '') {
      debouncedSearch(searchValue);
    }
  }, [searchValue, debouncedSearch]);
}
