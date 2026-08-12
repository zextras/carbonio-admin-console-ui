/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getSoapFetchRequest } from '@zextras/ui-shared';

import type { BackupAccountsApiResponse, ServiceResult } from '../../types';
import { parseBackupAccountsResponse, type ParsedBackupAccounts } from './parse-backup-accounts';

export type GetBackupAccountsParams = {
  domain: string;
  filter: string;
  legalHold: boolean;
  page: number;
  pageSize: number;
};

export type GetBackupAccountsResult = ServiceResult<ParsedBackupAccounts>;

export async function getBackupAccounts({
  domain,
  filter,
  legalHold,
  page,
  pageSize,
}: GetBackupAccountsParams): Promise<GetBackupAccountsResult> {
  const url = `/service/extension/zextras_admin/backup/getBackupAccounts?page=${page}&pageSize=${pageSize}&domains=${domain}&filter=${filter}&legalHold=${legalHold}`;

  try {
    const data = await getSoapFetchRequest<BackupAccountsApiResponse>(url);
    const errorMessage = data.all_server?.error?.message;
    if (errorMessage) {
      return { type: 'error', error: errorMessage };
    }
    return { type: 'success', ...parseBackupAccountsResponse(data) };
  } catch (error) {
    return {
      type: 'error',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
