/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { batchService } from '@zextras/ui-shared';

import { domainQueryKeys } from './domain-query-keys';

type BatchDelegatesVars = {
  reqObject: Record<string, unknown>;
  otherAccount?: string;
};

type BatchFault = { Reason?: { Text?: string }; Detail?: { Error?: { Detail?: string } } };

/**
 * A Batch continues past failing sub-requests and reports them as `Fault` entries of a successful
 * BatchResponse, so they are turned into a rejection here instead of being reported as success.
 */
async function runBatch(vars: BatchDelegatesVars) {
  const response = await batchService(vars.reqObject, vars.otherAccount);
  const faults = (response?.Fault ?? []) as Array<BatchFault>;
  if (faults.length > 0) {
    throw new Error(faults[0].Reason?.Text ?? faults[0].Detail?.Error?.Detail ?? 'Batch failed');
  }
  return response;
}

export const useBatchDelegates = (accountId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: runBatch,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: domainQueryKeys.accountGrants(accountId),
      });
      queryClient.invalidateQueries({
        queryKey: domainQueryKeys.accountMembership(accountId),
      });
    },
  });
};
