/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fetchExternalSoap } from '@zextras/ui-shared';

import type { ServiceResult, SetUnsetLegalHoldResponse } from '../../types';
import { extractLegalHoldAccounts } from './parse-backup-accounts';

type SetUnsetLegalHoldRequest = {
  ui: boolean;
  command: string;
  accounts: string;
};

export type SetUnsetLegalHoldResult = ServiceResult<{
  accounts: ReturnType<typeof extractLegalHoldAccounts>;
}>;

export async function setUnsetLegalHold(
  status: string,
  id: string,
  servers: string,
): Promise<SetUnsetLegalHoldResult> {
  try {
    const data = await fetchExternalSoap<SetUnsetLegalHoldRequest, SetUnsetLegalHoldResponse>(
      `/service/extension/zextras_admin/backup/legalHold?targetServers=${servers}`,
      {
        ui: true,
        command: status,
        accounts: id,
      },
    );
    return { type: 'success', accounts: extractLegalHoldAccounts(data) };
  } catch (error) {
    return {
      type: 'error',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
