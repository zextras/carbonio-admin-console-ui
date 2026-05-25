/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';
import { searchDirectory } from '@zextras/ui-shared';

import { cosQueryKeys } from './cos-query-keys';

export const useTotalDomains = (cosId: string | undefined) => {
  return useQuery({
    queryKey: cosQueryKeys.totalDomains(cosId ?? ''),
    queryFn: async () => {
      const query = `(zimbraDomainDefaultCOSId=${cosId})`;
      const data = await searchDirectory('', 'domains', '', query, 0, -1);
      return data?.searchTotal ?? 0;
    },
    enabled: !!cosId,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
