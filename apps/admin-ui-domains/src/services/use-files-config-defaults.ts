/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { filesConfigQueryKeys } from './files-config-query-keys';
import { getFilesConfigDefaults } from './get-files-config-defaults';

export const useFilesConfigDefaults = (enabled = true) => {
  return useQuery({
    queryKey: filesConfigQueryKeys.defaults(),
    queryFn: async () => {
      const res = await getFilesConfigDefaults();
      if (res.type === 'error') {
        throw new Error(res.error);
      }
      return res;
    },
    enabled,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
