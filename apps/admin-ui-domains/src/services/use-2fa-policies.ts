/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import type { TwoFactorAuthPolicyValues } from '../../types';
import { domainQueryKeys } from './domain-query-keys';
import { list2faPolicies } from './list-2fa-policies';

export function parse2faPolicies(res: any): Array<TwoFactorAuthPolicyValues> {
	if (!res?.Body?.response?.content) {
		return [];
	}
	const content = JSON.parse(res.Body.response.content);
	return content?.response?.values ?? [];
}

export const use2faPolicies = (domain: string | undefined) =>
	useQuery({
		queryKey: domainQueryKeys.twoFactorPolicies(domain ?? ''),
		queryFn: async () => parse2faPolicies(await list2faPolicies(domain ?? '')),
		enabled: domain !== undefined,
		staleTime: 30_000,
		retry: 1,
		refetchOnWindowFocus: false,
	});
