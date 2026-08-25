/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { getDatasource } from './get-datasource-service';

export function useGalDataSources(accountId: string | undefined) {
  return useQuery({
    queryKey: domainQueryKeys.galDataSources(accountId ?? ''),
    queryFn: () => getDatasource(accountId!),
    enabled: !!accountId,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
