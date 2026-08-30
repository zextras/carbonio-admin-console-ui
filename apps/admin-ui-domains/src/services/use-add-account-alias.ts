/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addAccountAliasRequest } from './account-alias';
import { domainQueryKeys } from './domain-query-keys';

type AccountAliasVars = {
  id: string;
  alias: string;
};

export const useAddAccountAlias = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: AccountAliasVars) => addAccountAliasRequest(vars.id, vars.alias),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: domainQueryKeys.accountDetail(vars.id),
      });
      queryClient.invalidateQueries({
        queryKey: domainQueryKeys.accountListDirectory.base(),
      });
    },
  });
};
