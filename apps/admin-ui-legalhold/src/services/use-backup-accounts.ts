/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getBackupAccounts, type GetBackupAccountsParams } from './get-backup-accounts';
import { legalHoldQueryKeys } from './legal-hold-query-keys';

export function useBackupAccounts(params: GetBackupAccountsParams) {
  return useQuery({
    queryKey: legalHoldQueryKeys.backupAccounts(
      params.domain,
      params.filter,
      params.legalHold,
      params.page,
      params.pageSize,
    ),
    queryFn: async () => {
      const result = await getBackupAccounts(params);
      if (result.type === 'error') {
        throw new Error(result.error);
      }
      return result;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
