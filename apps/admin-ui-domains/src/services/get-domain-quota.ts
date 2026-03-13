/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { STORAGES_API_BASE_URL } from '../constants';

export type GetDomainQuotaRawResponse = {
  limit: number;
};

type GetDomainQuotaResponse =
  | {
      type: 'success';
      limit: number;
    }
  | {
      type: 'not-set';
    }
  | {
      type: 'error';
      error: string;
    };

/**
 * Returns the quota information for a specific domain.
 * @param domainId The ID of the domain.
 * @returns The quota information for the domain.
 */
export const getDomainQuota = async (domainId: string): Promise<GetDomainQuotaResponse> => {
  const url = `${STORAGES_API_BASE_URL}/quota/config/domains/${domainId}`;
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(url, { headers });
    if (response.status === 404) {
      return { type: 'not-set' } satisfies GetDomainQuotaResponse;
    }
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = (await response.json()) as GetDomainQuotaRawResponse;
    return {
      type: 'success',
      limit: data.limit,
    } satisfies GetDomainQuotaResponse;
  } catch (error) {
    return {
      type: 'error',
      error: error instanceof Error ? error.message : String(error),
    } satisfies GetDomainQuotaResponse;
  }
};
