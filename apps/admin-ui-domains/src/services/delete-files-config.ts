/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { FILES_ADMIN_API_BASE_URL } from '../constants';
import { FilesConfigScope } from './get-files-config-raw';

type DeleteFilesConfigResponse =
  | {
      type: 'success';
    }
  | {
      type: 'error';
      error: string;
    };

/**
 * Clears a single override at a scope (revert-to-inherited). Idempotent.
 * @param scope The scope to write (account or cos).
 * @param id The identifier of the scope object.
 * @param key The config key to clear.
 * @returns The result of the operation.
 */
export const deleteFilesConfigOverride = async (
  scope: FilesConfigScope,
  id: string,
  key: string,
): Promise<DeleteFilesConfigResponse> => {
  const url = `${FILES_ADMIN_API_BASE_URL}/config/raw/${scope}/${id}/${key}`;
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
      } satisfies DeleteFilesConfigResponse;
    })
    .catch((error) => {
      return {
        type: 'error',
        error: error.message,
      } satisfies DeleteFilesConfigResponse;
    });
};
