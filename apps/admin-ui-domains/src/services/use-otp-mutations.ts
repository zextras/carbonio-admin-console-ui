/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { deleteTotp, generateTotp, restoreTotp } from './otp-service';

/**
 * TOTP mutations for an account. Hooks own invalidation only; snackbars are
 * shown at the call site via `mutate(vars, { onSuccess, onError })`
 * (recorded repo convention).
 */

export const useGenerateTotp = (account: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => generateTotp(account),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: domainQueryKeys.otpList(account),
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
