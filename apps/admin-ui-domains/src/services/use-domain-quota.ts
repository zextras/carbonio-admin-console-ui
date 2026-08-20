/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { getDomainQuota } from './get-domain-quota';

export const useDomainQuota = (domainId: string | undefined, enabled = true) => {
  return useQuery({
    queryKey: domainQueryKeys.quota(domainId ?? ''),
    queryFn: async () => {
      const res = await getDomainQuota(domainId!);
      if (res.type === 'error') {
        throw new Error(res.error);
      }
      return res;
    },
    enabled: !!domainId && enabled,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
