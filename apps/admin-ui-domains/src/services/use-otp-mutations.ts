/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { deleteTotp, generateTotp, restoreTotp } from './otp-service';

export const useGenerateTotp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ account }: { account: string }) => generateTotp(account),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: domainQueryKeys.otpList(vars.account),
      });
    },
  });
};

export const useDeleteTotp = (account: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteTotp(account, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: domainQueryKeys.otpList(account),
      });
    },
  });
};

export const useRestoreTotp = (account: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => restoreTotp(account, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: domainQueryKeys.otpList(account),
      });
    },
  });
};
