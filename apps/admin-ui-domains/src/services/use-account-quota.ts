/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { getAccountQuota } from './get-account-quota';

export const useAccountQuota = (accountId: string | undefined, enabled = true) =>
	useQuery({
		queryKey: domainQueryKeys.accountQuota(accountId ?? ''),
		queryFn: async () => {
			const res = await getAccountQuota(accountId!);
			if (res.type === 'error') {
				throw new Error(res.error);
			}
			return res;
		},
		enabled: !!accountId && enabled,
		staleTime: 30_000,
		retry: 1,
		refetchOnWindowFocus: false,
	});
