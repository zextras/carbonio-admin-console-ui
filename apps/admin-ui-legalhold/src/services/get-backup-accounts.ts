/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getBackupAccounts as fetchBackupAccounts } from '@zextras/ui-shared';

import type { BackupAccountItem, ServiceResult } from '../../types';

export type GetBackupAccountsParams = {
  domain: string;
  filter: string;
  legalHold: boolean;
  page: number;
  pageSize: number;
};

export type GetBackupAccountsResult = ServiceResult<{
  accounts: Array<BackupAccountItem>;
  maxPage: number;
}>;

export async function getBackupAccounts({
  domain,
  filter,
  legalHold,
  page,
  pageSize,
}: GetBackupAccountsParams): Promise<GetBackupAccountsResult> {
  try {
    const data = await fetchBackupAccounts({
      page,
      pageSize,
      domains: domain,
      filter,
      legalHold,
    });
    if (data.allServerError) {
      return { type: 'error', error: data.allServerError };
    }
    return {
      type: 'success',
      accounts: data.accounts as Array<BackupAccountItem>,
      maxPage: data.maxPage,
    };
  } catch (error) {
    return {
      type: 'error',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
