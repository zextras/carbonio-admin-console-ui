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
  total_limit: number;
  total_used: number;
};

type GetAccountQuotaResponse =
  | {
      type: 'success';
      computedTotalLimit: number;
      totalUsed: number;
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
		throw new Error(`API request failed with status ${response.status}`);
	  }
	  return response.json() as Promise<GetAccountQuotaRawResponse>;
	})
	.then((data) => {
	  const { total_limit, total_used } = data;
	  return {
		type: 'success',
		computedTotalLimit: total_limit,
		totalUsed: total_used,
	  } satisfies GetAccountQuotaResponse;
	})
	.catch((error) => {
	  return {
		type: 'error',
		error: error.message,
	  } satisfies GetAccountQuotaResponse;
	});
};
