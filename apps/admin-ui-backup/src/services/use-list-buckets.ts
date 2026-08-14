/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import type { BucketItem } from '../../types';
import { backupQueryKeys } from './backup-query-keys';
import { listBuckets } from './list-buckets';

export const useListBuckets = (serverName: string) =>
  useQuery<{
    buckets: Array<BucketItem>;
    ok: boolean;
  }>({
    queryKey: backupQueryKeys.buckets(),
    queryFn: async () => {
      const response = await listBuckets(serverName);
      return {
        ok: response.ok,
        buckets: response.ok ? response.response.values : [],
      };
    },
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
