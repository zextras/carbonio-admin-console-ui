/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { distributionListAction } from './distribution-list-action-service';
import { domainQueryKeys } from './domain-query-keys';

export type DistributionListActionVars = {
  dl: Record<string, unknown>;
  action?: Record<string, unknown>;
};

/**
 * Runs a `DistributionListAction` (owner/send-as/send-to rights, …).
 * The hook owns cache invalidation only, with snackbars at the call site via
 * `mutate(vars, { onSuccess, onError })` (recorded repo convention).
 */
export const useDistributionListAction = (listId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: DistributionListActionVars) =>
      distributionListAction(vars.dl, vars.action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.distributionList(listId) });
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.distributionLists() });
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.distributionListGrants(listId) });
    },
  });
};
