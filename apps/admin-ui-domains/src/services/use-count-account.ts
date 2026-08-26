/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { countAccount } from './count-account-service';
import { domainQueryKeys } from './domain-query-keys';

export function parseAccountCount(res: unknown): number {
  const coses = (res as { cos?: Record<string, { name?: string; _content?: string }> })?.cos;
  if (!coses) {
    return 0;
  }
  let counter = 0;
  for (const key in coses) {
    if (coses[key]?.name !== 'defaultExternal') {
      counter += Number(coses[key]?._content ?? 0);
    }
  }
  return counter;
}

export const useCountAccount = (domainName: string | undefined) =>
  useQuery({
    queryKey: domainQueryKeys.accountCount(domainName ?? ''),
    queryFn: () => countAccount(domainName!),
    select: parseAccountCount,
    enabled: !!domainName,
    staleTime: 30_000,
    retry: 1,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
