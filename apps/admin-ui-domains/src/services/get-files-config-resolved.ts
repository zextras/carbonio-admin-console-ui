/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { FILES_ADMIN_API_BASE_URL } from '../constants';
import { FilesConfigSource } from './get-files-config-raw';

/** Resolved config FOR A USER: every declared key, its effective value and the winning source tier. */
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
 * Returns the config resolved for a user (account > cos > domain > default), including the
 * account tier, with the winning source per key. Used for the account scope: when the source
 * is not `account` the resolved value IS the inherited baseline; when it is `account` the value
 * is the account override itself (the underlying baseline is not exposed by this endpoint).
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
