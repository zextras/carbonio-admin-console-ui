/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { addMailingListAliasRequest } from './mailing-list-alias';

/**
 * Adds an alias to a distribution list. The hook owns cache invalidation
 * only, with snackbars at the call site via `mutate(vars, { onSuccess, onError })`
 * (recorded repo convention).
 */
export const useAddMailingListAlias = (listId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alias: string) => addMailingListAliasRequest(listId, alias),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.distributionList(listId) });
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.distributionLists() });
    },
  });
};
