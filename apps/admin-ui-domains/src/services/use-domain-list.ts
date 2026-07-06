/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { getDomainList } from './search-domain-service';

export const useDomainList = () => {
  return useQuery({
    queryKey: domainQueryKeys.list(),
    queryFn: async () => {
      const allDomains: Array<{
        name: string;
        id: string;
        a: Array<{ n: string; _content: string }>;
      }> = [];
      let offset = 0;
      let hasMore = true;
      while (hasMore) {
        const response = await getDomainList('', offset);
        if (response?.domain?.length) {
          allDomains.push(...response.domain);
        }
        hasMore = response?.more ?? false;
        offset += 50;
      }
      return allDomains;
    },
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
