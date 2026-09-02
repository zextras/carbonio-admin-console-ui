/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getCosQuota } from '../services/get-cos-quota';

/**
 * Query key for a COS quota, shared by every consumer of the COS quota
 * query so invalidation is consistent across apps.
 */
export const cosQuotaQueryKey = (cosId: string) => ['cos', 'cos-quota', cosId] as const;

export const useCosQuota = (cosId: string | undefined, enabled: boolean) => {
	return useQuery({
		queryKey: cosQuotaQueryKey(cosId ?? ''),
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
