/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { getDomainQuotaReport } from './domain-quota-report';

export const useDomainQuotaReport = (domainName: string | undefined) =>
  useQuery({
    queryKey: domainQueryKeys.quotaReport(domainName ?? ''),
    queryFn: async () => {
      const res = await getDomainQuotaReport(domainName!);
      if (res.type === 'error') {
        throw new Error(res.error);
      }
      return res.accounts;
    },
    enabled: !!domainName,
    retry: 1,
    refetchOnWindowFocus: false,
  });
