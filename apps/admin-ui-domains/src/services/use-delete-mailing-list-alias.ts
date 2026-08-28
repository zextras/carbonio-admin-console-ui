/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteMailingListAliasRequest } from './delete-mailing-list-alias';
import { domainQueryKeys } from './domain-query-keys';

/**
 * Removes an alias from a distribution list. The hook owns cache invalidation
 * only, with snackbars at the call site via `mutate(vars, { onSuccess, onError })`
 * (recorded repo convention).
 */
export const useDeleteMailingListAlias = (listId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alias: string) => deleteMailingListAliasRequest(listId, alias),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.distributionList(listId) });
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.distributionLists() });
    },
  });
};
