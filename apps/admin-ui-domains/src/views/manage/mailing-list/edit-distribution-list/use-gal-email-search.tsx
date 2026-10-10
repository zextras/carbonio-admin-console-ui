/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type ComboboxItem } from '@zextras/ui-components';
import { useState } from 'react';

import { useSearchGal } from '../../../../services/use-search-gal';
import { useDebouncedValue } from '../edit-mailing-detail/hooks/use-debounced-value';

/**
 * Shared GAL email search used by the owners / send-as / send-to tabs:
 * owns the input value and debounces it into the cached `useSearchGal`
 * query. Combobox items ({id, label}) are derived directly from the query
 * data; the raw contact list is exposed for grantee-type resolution (see
 * `useGalContactTypes`).
 */
export function useGalEmailSearch() {
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchValue = useDebouncedValue(searchValue);

  const galQuery = useSearchGal(debouncedSearchValue);

  const contactList = galQuery.data?.cn ?? [];

  const items: Array<ComboboxItem> = contactList.map((item: any) => ({
    id: item?.id,
    label: item?._attrs?.email,
  }));

  const onSelectItem = (item: ComboboxItem): void => {
    setSearchValue(item.label);
  };

  return {
    searchValue,
    setSearchValue,
    items,
    contactList,
    isFetching: galQuery.isFetching,
    onSelectItem,
    isDebouncing: debouncedSearchValue !== searchValue,
  };
}
