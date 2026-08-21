/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fetchExternalSoap } from '@zextras/ui-shared';

import type { RestoreRawResponse, ServiceResult } from '../../types';

type RestoreRequest = {
  srcAccountName: string;
  dstAccountName: string;
  date: number;
  undelete: boolean;
  undeleteStartDate: number | null;
};

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
    const rawData = await fetchExternalSoap<RestoreRequest, RestoreRawResponse>(
      `/service/extension/zextras_admin/backup/doRestoreOnNewAccount?targetServers=${targetServers}`,
      {
        srcAccountName,
        dstAccountName,
        date,
        undelete: unDelete,
        undeleteStartDate: undeleteDate,
      },
    );

    if (rawData.error) {
      return { type: 'error', error: rawData.error.message ?? 'Restore failed' };
    }

    const parsedData = rawData.operationId
      ? rawData
      : (JSON.parse(rawData.Body?.response?.content || '{}') as RestoreRawResponse);
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
