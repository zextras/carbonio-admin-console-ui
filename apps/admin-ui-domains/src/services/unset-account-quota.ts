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

type UnsetAccountQuotaResponse =
  | {
      type: 'success';
    }
  | {
      type: 'error';
      error: string;
    };

/**
 * Unsets the quota limit for a specific account.
 * @param accountId The ID of the account.
 * @returns The result of the quota update operation.
 */
export const unsetAccountQuota = async (accountId: string): Promise<UnsetAccountQuotaResponse> => {
  const url = `${STORAGES_API_BASE_URL}/quota/config/accounts/${accountId}`;
  const headers = {
    'Content-Type': 'application/json',
    [STORAGES_API_VERSION_HEADER]: STORAGES_API_VERSION,
  };

  return fetch(url, { method: 'DELETE', headers })
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
    })
    .then(() => {
      return {
        type: 'success',
      } satisfies UnsetAccountQuotaResponse;
    })
    .catch((error) => {
      return {
        type: 'error',
        error: error.message,
      } satisfies UnsetAccountQuotaResponse;
    });
};
