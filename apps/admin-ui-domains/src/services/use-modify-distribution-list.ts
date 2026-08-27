/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { modifyDistributionList } from './modify-distributionlist-service';

export type DistributionListAttribute = { n: string; _content: string };

/**
 * Modifies distribution list attributes. The hook owns cache invalidation
 * only, with snackbars at the call site via `mutate(vars, { onSuccess, onError })`
 * (recorded repo convention).
 */
export const useModifyDistributionList = (listId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attributes: Array<DistributionListAttribute>) =>
      modifyDistributionList(listId, attributes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.distributionList(listId) });
    },
  });
};
