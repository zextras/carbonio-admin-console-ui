/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation } from '@tanstack/react-query';

import { getAccount } from './get-account';

export function useGetAccount() {
  return useMutation({
    mutationFn: async (accountName: string) => {
      const result = await getAccount(accountName);
      if (result.type === 'error') {
        throw new Error(result.error);
      }
      return result.account;
    },
  });
}
