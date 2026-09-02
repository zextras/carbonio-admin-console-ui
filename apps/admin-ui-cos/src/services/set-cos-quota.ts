/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ComputedLimit } from '@zextras/ui-shared';

import {
  STORAGES_API_BASE_URL,
  STORAGES_API_VERSION,
  STORAGES_API_VERSION_HEADER,
} from '../constants';

type SetCosQuotaResponse =
  | {
      type: 'success';
    }
  | {
      type: 'error';
      error: string;
    };

/**
 * Sets the quota limit for a specific COS.
 * @param cosId The ID of the COS.
 * @param limit The quota limit to be set for the COS.
 * @returns The result of the quota update operation.
 */
export const setCosQuota = async (cosId: string, limit: ComputedLimit): Promise<SetCosQuotaResponse> => {
  const url = `${STORAGES_API_BASE_URL}/quota/config/cos/${cosId}`;
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
      } satisfies SetCosQuotaResponse;
    })
    .catch((error) => {
      return {
        type: 'error',
        error: error.message,
      } satisfies SetCosQuotaResponse;
    });
};
