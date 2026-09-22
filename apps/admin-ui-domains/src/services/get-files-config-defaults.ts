/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { FILES_ADMIN_API_BASE_URL } from '../constants';

/** Base defaults, complete: every declared key is present, with a null value when the default is empty. */
export type FilesConfigDefaults = Record<string, string | null>;

type GetFilesConfigDefaultsResponse =
  | {
      type: 'success';
      defaults: FilesConfigDefaults;
    }
  | {
      type: 'error';
      error: string;
    };

/**
 * Returns the base defaults for every declared key (read-only, complete).
 * This is the inherited baseline for the cos and domain scopes.
 * @returns The complete default map.
 */
export const getFilesConfigDefaults = async (): Promise<GetFilesConfigDefaultsResponse> => {
  const url = `${FILES_ADMIN_API_BASE_URL}/config/raw/default`;
  const headers = {
    'Content-Type': 'application/json',
  };

  return fetch(url, { headers })
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json() as Promise<FilesConfigDefaults>;
    })
    .then((data) => {
      return {
        type: 'success',
        defaults: data,
      } satisfies GetFilesConfigDefaultsResponse;
    })
    .catch((error) => {
      return {
        type: 'error',
        error: error.message,
      } satisfies GetFilesConfigDefaultsResponse;
    });
};
