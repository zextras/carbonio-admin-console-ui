/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { FILES_ADMIN_API_BASE_URL } from '../constants';

export type FilesConfigScope = 'account' | 'cos' | 'domain';

/** Sparse map of the keys overridden AT a single scope. A key is absent when it is not overridden there. */
export type FilesConfigOverrides = Record<string, string>;

type GetFilesConfigRawResponse =
  | {
      type: 'success';
      overrides: FilesConfigOverrides;
    }
  | {
      type: 'error';
      error: string;
    };

/**
 * Returns the raw overrides set AT a single scope (no hierarchy resolution).
 * Keys not overridden at that scope are absent from the response.
 * @param scope The scope to read (account, cos or domain).
 * @param id The identifier of the scope object.
 * @returns The sparse override map for the scope.
 */
export const getFilesConfigRaw = async (
  scope: FilesConfigScope,
  id: string,
): Promise<GetFilesConfigRawResponse> => {
  const url = `${FILES_ADMIN_API_BASE_URL}/config/raw/${scope}/${id}`;
  const headers = {
    'Content-Type': 'application/json',
  };

  return fetch(url, { headers })
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json() as Promise<FilesConfigOverrides>;
    })
    .then((data) => {
      return {
        type: 'success',
        overrides: data,
      } satisfies GetFilesConfigRawResponse;
    })
    .catch((error) => {
      return {
        type: 'error',
        error: error.message,
      } satisfies GetFilesConfigRawResponse;
    });
};
