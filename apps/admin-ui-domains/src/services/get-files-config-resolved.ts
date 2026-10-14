/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { FILES_ADMIN_API_BASE_URL } from '../constants';
import { FilesConfigSource } from './get-files-config-raw';

/** Config resolved for a user (account > cos > default): the effective value and its winning source. */
export type FilesConfigResolved = Record<
  string,
  { value: string | null; source: FilesConfigSource }
>;

type GetFilesConfigResolvedResponse =
  | {
      type: 'success';
      config: FilesConfigResolved;
    }
  | {
      type: 'error';
      error: string;
    };

/**
 * Returns the config resolved for an account (account > cos > default), with the winning
 * source tier per key. Drives the account scope display: it tells the effective value AND
 * whether it comes from the account override, the cos, or the base default.
 * @param userId The account to resolve for.
 * @returns The resolved config keyed by config key.
 */
export const getFilesConfigResolved = async (
  userId: string,
): Promise<GetFilesConfigResolvedResponse> => {
  const url = `${FILES_ADMIN_API_BASE_URL}/config?userId=${encodeURIComponent(userId)}`;
  const headers = {
    'Content-Type': 'application/json',
  };

  return fetch(url, { headers })
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json() as Promise<FilesConfigResolved>;
    })
    .then((data) => {
      return {
        type: 'success',
        config: data,
      } satisfies GetFilesConfigResolvedResponse;
    })
    .catch((error) => {
      return {
        type: 'error',
        error: error.message,
      } satisfies GetFilesConfigResolvedResponse;
    });
};
