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

type UnsetCosQuotaResponse =
  | {
      type: 'success';
    }
  | {
      type: 'error';
      error: string;
    };

/**
 * Unsets the quota limit for a specific COS.
 * @param cosId The ID of the COS.
 * @returns The result of the quota update operation.
 */
export const unsetCosQuota = async (cosId: string): Promise<UnsetCosQuotaResponse> => {
  const url = `${STORAGES_API_BASE_URL}/quota/config/cos/${cosId}`;
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
      } satisfies UnsetCosQuotaResponse;
    })
    .catch((error) => {
      return {
        type: 'error',
        error: error.message,
      } satisfies UnsetCosQuotaResponse;
    });
};
