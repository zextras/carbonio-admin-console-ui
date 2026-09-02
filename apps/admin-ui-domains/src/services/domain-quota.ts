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
