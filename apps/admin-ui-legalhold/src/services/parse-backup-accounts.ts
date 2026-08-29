/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { BackupAccountItem, LegalHoldOperationResponse, ServerBackupResponse } from '../../types';

function isServerBackupResponse(value: unknown): value is ServerBackupResponse {
  return Boolean(value && typeof value === 'object' && 'response' in value);
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
