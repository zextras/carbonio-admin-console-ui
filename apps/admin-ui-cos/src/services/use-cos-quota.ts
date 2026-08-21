
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { cosQueryKeys } from './cos-query-keys';
import { getCosQuota } from './get-cos-quota';

export const useCosQuota = (cosId: string | undefined, enabled: boolean) => {
  return useQuery({
    queryKey: cosQueryKeys.cosQuota(cosId ?? ''),
    queryFn: async () => {
      const res = await getCosQuota(cosId!);
      if (res.type === 'error') {
        throw new Error(res.error);
      }
      return res;
    },
    enabled: !!cosId && enabled,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
