/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteDistributionList } from './delete-distribution-list';
import { domainQueryKeys } from './domain-query-keys';

/**
 * Deletes a distribution list. The hook owns cache invalidation only, with
 * snackbars at the call site via `mutate(undefined, { onSuccess, onError })`
 * (recorded repo convention).
 */
export const useDeleteDistributionList = (listId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteDistributionList(listId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.distributionList(listId) });
    },
  });
};
