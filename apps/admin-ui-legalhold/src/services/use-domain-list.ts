/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { legalHoldQueryKeys } from './legal-hold-query-keys';
import { getDomainList } from './search-domain-service';

export function useDomainList(searchKeyword: string, enabled = true) {
  return useQuery({
    queryKey: legalHoldQueryKeys.domains(searchKeyword),
    queryFn: async () => {
      const result = await getDomainList(searchKeyword, 0);
      if (result.type === 'error') {
        throw new Error(result.error);
      }
      return result;
    },
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
