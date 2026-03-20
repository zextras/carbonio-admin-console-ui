/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { STORAGES_API_BASE_URL } from '../constants';

type SetDomainQuotaResponse =
  | {
      type: 'success';
    }
  | {
      type: 'error';
      error: string;
    };

/**
 * Sets the quota limit for a specific domain.
 * @param domainId The ID of the domain.
 * @param limit The quota limit in bytes to be set for the domain.
 * @returns The result of the quota update operation.
 */
export const setDomainQuota = async (domainId: string, limit: number): Promise<SetDomainQuotaResponse> => {
  const url = `${STORAGES_API_BASE_URL}/quota/config/domains/${domainId}`;
  const headers = {
    'Content-Type': 'application/json',
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
      } satisfies SetDomainQuotaResponse;
    })
    .catch((error) => {
      return {
        type: 'error',
        error: error.message,
      } satisfies SetDomainQuotaResponse;
    });
};
