/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  STORAGES_API_BASE_URL,
  STORAGES_API_VERSION,
  STORAGES_API_VERSION_HEADER,
} from '../constants';

type SetAccountQuotaResponse =
  | {
      type: 'success';
    }
  | {
      type: 'error';
      error: string;
    };

/**
 * Sets the quota limit for a specific account.
 * @param accountId The ID of the account.
 * @param request The quota limit request.
 * @returns The result of the quota update operation.
 */
export const setAccountQuota = async (accountId: string, limit: number): Promise<SetAccountQuotaResponse> => {
  const url = `${STORAGES_API_BASE_URL}/quota/config/accounts/${accountId}`;
  const headers = {
    'Content-Type': 'application/json',
    [STORAGES_API_VERSION_HEADER]: STORAGES_API_VERSION,
  };

  return fetch(url, { method: 'PUT', headers, body: JSON.stringify({ limit }) })
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
    })
    .then(() => {
      return {
        type: 'success',
      } satisfies SetAccountQuotaResponse;
    })
    .catch((error) => {
      return {
        type: 'error',
        error: error.message,
      } satisfies SetAccountQuotaResponse;
    });
};
