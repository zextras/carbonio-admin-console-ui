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

export type GetAccountQuotaRawResponse = {
  total: {
    used: number;
    computedLimit: number;
  };
  modules: {
    mailbox: { used: number };
    files: { used: number };
    wsc: { used: number };
  };
};

type GetAccountQuotaResponse =
  | {
      type: 'success';
      totalComputedLimit: number;
      totalUsed: number;
      usedByModules: {
        mailbox: number;
        files: number;
        wsc: number;
      };
    }
  | {
      type: 'error';
      error: string;
    };

/**
 * Returns the quota information for a specific account.
 * @param accountId The ID of the account.
 * @returns The quota information for the account.
 */
export const getAccountQuota = async (accountId: string): Promise<GetAccountQuotaResponse> => {
  const url = `${STORAGES_API_BASE_URL}/quota/accounts/${accountId}`;
  const headers = {
    'Content-Type': 'application/json',
    [STORAGES_API_VERSION_HEADER]: STORAGES_API_VERSION,
  };

  return fetch(url, { headers })
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json() as Promise<GetAccountQuotaRawResponse>;
    })
    .then((data) => {
      const { total } = data;
      return {
        type: 'success',
        totalComputedLimit: total.computedLimit,
        totalUsed: total.used,
        usedByModules: {
          mailbox: data.modules.mailbox.used,
          files: data.modules.files.used,
          wsc: data.modules.wsc.used,
        },
      } satisfies GetAccountQuotaResponse;
    })
    .catch((error) => {
      return {
        type: 'error',
        error: error.message,
      } satisfies GetAccountQuotaResponse;
    });
};
