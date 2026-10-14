/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { filesConfigQueryKeys } from './files-config-query-keys';
import { FilesConfigScope, getFilesConfigRaw } from './get-files-config-raw';

export const useFilesConfigRaw = (
  scope: FilesConfigScope,
  id: string | undefined,
  enabled = true,
) => {
  return useQuery({
    queryKey: filesConfigQueryKeys.raw(scope, id ?? ''),
    queryFn: async () => {
      const res = await getFilesConfigRaw(scope, id!);
      if (res.type === 'error') {
        throw new Error(res.error);
      }
      return res;
    },
    enabled: !!id && enabled,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
