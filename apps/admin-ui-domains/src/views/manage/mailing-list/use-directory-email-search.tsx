/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { type ComboboxItem, useSnackbar } from '@zextras/ui-components';
import { searchDirectory } from '@zextras/ui-shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { RECORD_DISPLAY_LIMIT } from '../../../constants';
import { generateSnackbarFromError } from '../../../utils/generate-snackbar-error';
import { useDebouncedValue } from './edit-mailing-detail/hooks/use-debounced-value';

export type DirectorySearchConfig = {
  attrs: string;
  types: string;
  buildQuery: (keyword: string) => string;
};

/**
 * Shared directory search used by the members tabs: owns the input value,
 * debounces it into a cached `searchDirectory` query and exposes combobox
 * items ({id, label}) built from the merged accounts, distribution lists
 * and aliases. The config must be a module-level constant so the query key
 * stays stable.
 */
export function useDirectoryEmailSearch(config: DirectorySearchConfig) {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const [searchValue, setSearchValue] = useState('');

  const debouncedSearchValue = useDebouncedValue(searchValue);
  const query = config.buildQuery(debouncedSearchValue);

  const searchQuery = useQuery({
    queryKey: ['directory-search', config.attrs, config.types, query],
    queryFn: async () => {
      try {
        return await searchDirectory({
          attr: config.attrs,
          type: config.types,
          domainName: '',
          query,
          offset: 0,
          limit: RECORD_DISPLAY_LIMIT,
          sortBy: 'name',
        });
      } catch (error: any) {
        createSnackbar(generateSnackbarFromError(error, t));
        throw error;
      }
    },
    enabled: debouncedSearchValue !== '',
    placeholderData: keepPreviousData,
  });

  const data = searchQuery.data;
  const result: Array<any> = [];
  if (data?.dl) {
    result.push(...data.dl);
  }
  if (data?.account) {
    result.push(...data.account);
  }
  if (data?.alias) {
    result.push(...data.alias);
  }

  const items: Array<ComboboxItem> = result.map((item: any) => ({
    id: item?.id,
    label: item?.name,
  }));

  const onSelectItem = (item: ComboboxItem): void => {
    setSearchValue(item.label);
  };

  return { searchValue, setSearchValue, items, isFetching: searchQuery.isFetching, onSelectItem };
}
