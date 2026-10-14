/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { filesConfigQueryKeys } from './files-config-query-keys';
import { getFilesConfigResolved } from './get-files-config-resolved';

export const useFilesConfigResolved = (userId: string | undefined, enabled = true) => {
  return useQuery({
    queryKey: filesConfigQueryKeys.resolved(userId ?? ''),
    queryFn: async () => {
      const res = await getFilesConfigResolved(userId!);
      if (res.type === 'error') {
        throw new Error(res.error);
      }
      return res;
    },
    enabled: !!userId && enabled,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
