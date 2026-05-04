/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { STORAGES_API_BASE_URL } from '../constants';

type UnsetDomainQuotaResponse =
  | {
      type: 'success';
    }
  | {
      type: 'error';
      error: string;
    };

/**
 * Unsets the quota limit for a specific domain.
 * @param domainId The ID of the domain.
 * @returns The result of the quota update operation.
 */
export const unsetDomainQuota = async (domainId: string): Promise<UnsetDomainQuotaResponse> => {
  const url = `${STORAGES_API_BASE_URL}/quota/config/domains/${domainId}`;
  const headers = {
    'Content-Type': 'application/json',
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
      } satisfies UnsetDomainQuotaResponse;
    })
    .catch((error) => {
      return {
        type: 'error',
        error: error.message,
      } satisfies UnsetDomainQuotaResponse;
    });
};
