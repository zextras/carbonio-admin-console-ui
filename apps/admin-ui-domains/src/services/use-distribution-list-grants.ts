/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { DL } from '../constants';
import { domainQueryKeys } from './domain-query-keys';
import { getGrant } from './get-grant';
import { useDistributionListSnackbar } from './use-distribution-list';

export function buildDistributionListGrantsRequest(listId: string) {
  return {
    target: {
      type: DL,
      by: 'id',
      _content: listId,
    },
  };
}

export function useDistributionListGrants(listId: string | undefined) {
  const { fallback, error } = useDistributionListSnackbar();

  return useQuery({
    queryKey: domainQueryKeys.distributionListGrants(listId ?? ''),
    queryFn: async () => {
      try {
        return await getGrant(buildDistributionListGrantsRequest(listId ?? ''));
      } catch (err) {
        const caught = err instanceof Error ? err : new Error(fallback);
        error(caught);
        throw caught;
      }
    },
    enabled: Boolean(listId),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}
