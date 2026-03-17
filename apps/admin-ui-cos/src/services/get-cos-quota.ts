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

export type LimitedComputedLimit = { type: 'limited'; value: number };
export type UnlimitedComputedLimit = { type: 'unlimited' };
export type ComputedLimit = LimitedComputedLimit | UnlimitedComputedLimit;
export type QuotaSource = 'global' | 'cos';

export type GetCosQuotaRawResponse = {
  computedLimit: ComputedLimit & { source: QuotaSource };
};

type GetCosQuotaResponse =
  | {
      type: 'success';
      totalComputedLimit: ComputedLimit & { source: QuotaSource };
    }
  | {
      type: 'error';
      error: string;
    };

/**
 * Returns the quota information for a specific COS.
 * @param cosId The ID of the COS.
 * @returns The quota information for the COS.
 */
export const getCosQuota = async (cosId: string): Promise<GetCosQuotaResponse> => {
  const url = `${STORAGES_API_BASE_URL}/quota/cos/${cosId}`;
  const headers = {
    'Content-Type': 'application/json',
    [STORAGES_API_VERSION_HEADER]: STORAGES_API_VERSION,
  };

  return fetch(url, { headers })
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json() as Promise<GetCosQuotaRawResponse>;
    })
    .then((data) => {
      return {
        type: 'success',
        totalComputedLimit: data.computedLimit,
      } satisfies GetCosQuotaResponse;
    })
    .catch((error) => {
      return {
        type: 'error',
        error: error.message,
      } satisfies GetCosQuotaResponse;
    });
};
