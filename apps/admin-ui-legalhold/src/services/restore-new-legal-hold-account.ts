/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { doRestoreOnNewAccount } from '@zextras/ui-shared';

import type { ServiceResult } from '../../types';

export type RestoreLegalHoldResult = ServiceResult<{ operationId: string }>;

export async function doRestoreOnNewLegalHoldAccount(
  srcAccountName: string,
  dstAccountName: string,
  date: number,
  undeleteDate: number | null,
  unDelete: boolean,
  targetServers: string,
): Promise<RestoreLegalHoldResult> {
  try {
    const rawData = await doRestoreOnNewAccount(
      {
        srcAccountName,
        dstAccountName,
        date,
        undelete: unDelete,
        undeleteStartDate: undeleteDate,
      },
      targetServers,
    );

    if (rawData.error) {
      return { type: 'error', error: rawData.error.message ?? 'Restore failed' };
    }

    const parsedData = rawData.operationId
      ? rawData
      : (JSON.parse(rawData.Body?.response?.content || '{}') as typeof rawData);
    const message = parsedData.error?.message || parsedData.message;
    if (message) {
      return { type: 'error', error: message };
    }

    const operationId = rawData.operationId ?? parsedData.response?.operationId;
    if (!operationId) {
      return { type: 'error', error: 'No operationId returned' };
    }

    return { type: 'success', operationId };
  } catch (error) {
    return {
      type: 'error',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
