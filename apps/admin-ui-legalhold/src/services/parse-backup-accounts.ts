/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type {
  BackupAccountItem,
  BackupAccountsApiResponse,
  LegalHoldOperationResponse,
  ServerBackupResponse,
} from '../../types';

export type ParsedBackupAccounts = {
  accounts: Array<BackupAccountItem>;
  maxPage: number;
};

function isServerBackupResponse(value: unknown): value is ServerBackupResponse {
  return Boolean(value && typeof value === 'object' && 'response' in value);
}

export function parseBackupAccountsResponse(data: BackupAccountsApiResponse): ParsedBackupAccounts {
  if (data.accounts) {
    return {
      accounts: data.accounts,
      maxPage: data.maxPage ?? 0,
    };
  }

  const accounts: Array<BackupAccountItem> = [];
  const maxPages: Array<number> = [];

  Object.values(data).forEach((value) => {
    if (!isServerBackupResponse(value)) {
      return;
    }
    if (value.response?.accounts) {
      accounts.push(...value.response.accounts);
    }
    if (value.response?.maxPage !== undefined && value.response.maxPage >= 0) {
      maxPages.push(value.response.maxPage);
    }
  });

  return {
    accounts,
    maxPage: maxPages.length > 0 ? Math.max(...maxPages) : (data.maxPage ?? 0),
  };
}

export function extractLegalHoldAccounts(
  data: LegalHoldOperationResponse,
): Array<BackupAccountItem> {
  if (data.accounts?.length) {
    return data.accounts;
  }

  const accounts: Array<BackupAccountItem> = [];
  Object.values(data).forEach((value) => {
    if (isServerBackupResponse(value) && value.response?.accounts) {
      accounts.push(...value.response.accounts);
    }
  });
  return accounts;
}
