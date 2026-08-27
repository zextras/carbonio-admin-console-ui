/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { searchGal } from './search-gal-service';
import { useDistributionListSnackbar } from './use-distribution-list';

export const GAL_SEARCH_STALE_TIME = 30_000;

export function useSearchGal(keyword: string) {
  const { fallback, error } = useDistributionListSnackbar();

  return useQuery({
    queryKey: domainQueryKeys.galSearch(keyword),
    queryFn: async () => {
      try {
        return await searchGal(keyword);
      } catch (err) {
        const caught = err instanceof Error ? err : new Error(fallback);
        error(caught);
        throw caught;
      }
    },
    enabled: keyword.trim().length > 0,
    placeholderData: keepPreviousData,
    staleTime: GAL_SEARCH_STALE_TIME,
    refetchOnWindowFocus: false,
  });
}
