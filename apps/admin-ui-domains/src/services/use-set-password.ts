/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { setPasswordRequest } from './set-password';

type SetPasswordVars = {
  id: string;
  newPassword?: string;
};

export const useSetPassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: SetPasswordVars) => setPasswordRequest(vars.id, vars.newPassword),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: domainQueryKeys.accountDetail(vars.id),
      });
    },
  });
};
