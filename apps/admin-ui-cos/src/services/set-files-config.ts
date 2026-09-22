/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { FILES_ADMIN_API_BASE_URL } from '../constants';
import { FilesConfigScope } from './get-files-config-raw';

type SetFilesConfigResponse =
  | {
      type: 'success';
    }
  | {
      type: 'error';
      error: string;
    };

/**
 * Sets a single override at a scope (override-at-this-scope).
 * @param scope The scope to write (account, cos or domain).
 * @param id The identifier of the scope object.
 * @param key The config key to override.
 * @param value The value to set.
 * @returns The result of the operation.
 */
export const setFilesConfigOverride = async (
  scope: FilesConfigScope,
  id: string,
  key: string,
  value: string,
): Promise<SetFilesConfigResponse> => {
  const url = `${FILES_ADMIN_API_BASE_URL}/config/raw/${scope}/${id}`;
  const headers = {
    'Content-Type': 'application/json',
  };

  return fetch(url, { method: 'PUT', headers, body: JSON.stringify({ key, value }) })
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
    })
    .then(() => {
      return {
        type: 'success',
      } satisfies SetFilesConfigResponse;
    })
    .catch((error) => {
      return {
        type: 'error',
        error: error.message,
      } satisfies SetFilesConfigResponse;
    });
};
