/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createAccountRequest } from './create-account';
import { domainQueryKeys } from './domain-query-keys';

type CreateAccountVars = {
  attr: Record<string, string>;
  name: string;
  password: string;
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: CreateAccountVars) => createAccountRequest(vars.attr, vars.name, vars.password),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: domainQueryKeys.accountListDirectory.base(),
      });
    },
  });
};
