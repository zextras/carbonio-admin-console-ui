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
export type QuotaSource = 'global' | 'domain' | 'cos' | 'account';
export type QuotaStatus = 'UNDERQUOTA' | 'OVERQUOTA';

export type GetAccountQuotaRawResponse = {
  total: {
    used: number;
    computedLimit: ComputedLimit & { source: QuotaSource };
    status: QuotaStatus;
  };
  modules: {
    mailbox: { used: number };
    files: { used: number };
    wsc: { used: number };
  };
};

export type GetAccountQuotaResponse =
  | {
      type: 'success';
      totalComputedLimit: ComputedLimit;
      totalLimitSource: QuotaSource;
      totalStatus: QuotaStatus;
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
      const totalComputedLimit =
        total.computedLimit.type === 'limited'
          ? { value: total.computedLimit.value, type: total.computedLimit.type }
          : { type: total.computedLimit.type };

      return {
        type: 'success',
        totalComputedLimit,
        totalLimitSource: total.computedLimit.source,
        totalStatus: total.status,
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
 * @param limit The quota limit to be set for the account.
 * @returns The result of the quota update operation.
 */
export const setAccountQuota = async (accountId: string, limit: ComputedLimit): Promise<SetAccountQuotaResponse> => {
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
