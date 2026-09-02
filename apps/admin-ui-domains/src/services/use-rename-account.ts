/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { renameAccountRequest } from './rename-account';

type RenameAccountVars = {
  id: string;
  newName: string;
};

export const useRenameAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: RenameAccountVars) => renameAccountRequest(vars.id, vars.newName),
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
