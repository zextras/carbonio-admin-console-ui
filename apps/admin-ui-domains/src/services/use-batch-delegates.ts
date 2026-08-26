/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { batchService } from './batch-service';
import { domainQueryKeys } from './domain-query-keys';

type BatchDelegatesVars = {
  reqObject: Record<string, unknown>;
  otherAccount?: string;
};

export const useBatchDelegates = (accountId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: BatchDelegatesVars) => batchService(vars.reqObject, vars.otherAccount),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: domainQueryKeys.accountGrants(accountId),
      });
      queryClient.invalidateQueries({
        queryKey: domainQueryKeys.accountMembership(accountId),
      });
    },
  });
};
