/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { getDistributionListMembership } from './get-distributionlists-membership-service';
import { useDistributionListSnackbar } from './use-distribution-list';

export function useDistributionListMembership(listId: string | undefined) {
  const { fallback, error } = useDistributionListSnackbar();

  return useQuery({
    queryKey: domainQueryKeys.distributionListMembership(listId ?? ''),
    queryFn: async () => {
      try {
        return await getDistributionListMembership(listId ?? '');
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
