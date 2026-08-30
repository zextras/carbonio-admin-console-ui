/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type ComputedLimit, setAccountQuota, unsetAccountQuota } from './account-quota';
import { domainQueryKeys } from './domain-query-keys';

type SetAccountQuotaVars = {
  accountId: string;

  limit?: ComputedLimit;
};

export const useSetAccountQuota = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: SetAccountQuotaVars) => {
      const result =
        vars.limit === undefined
          ? await unsetAccountQuota(vars.accountId)
          : await setAccountQuota(vars.accountId, vars.limit);
      if (result.type === 'error') {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: domainQueryKeys.accountQuota(vars.accountId),
      });
      queryClient.invalidateQueries({
        queryKey: domainQueryKeys.accountDetail(vars.accountId),
      });
    },
  });
};
