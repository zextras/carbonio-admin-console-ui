/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteAccount } from './delete-account-service';
import { domainQueryKeys } from './domain-query-keys';

type DeleteAccountVars = {
  accountId: string;
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: DeleteAccountVars) => deleteAccount(vars.accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: domainQueryKeys.accountListDirectory.base(),
      });
    },
  });
};
