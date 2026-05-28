/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';
import { searchDirectory } from '@zextras/ui-shared';

import { cosQueryKeys } from './cos-query-keys';

const DOMAIN_ATTRS =
	'description,zimbraDomainName,zimbraDomainStatus,zimbraId,zimbraDomainType,zimbraDomainCOSMaxAccounts,zimbraDomainDefaultCOSId';

export const useCosDomains = (
	cosId: string | undefined,
	query: string,
	offset: number,
	limit: number,
) => {
	return useQuery({
		queryKey: cosQueryKeys.domains(cosId ?? '', query, offset, limit),
		queryFn: async () => {
			const data = await searchDirectory({
				attr: DOMAIN_ATTRS,
				type: 'domains',
				domainName: '',
				query,
				offset,
				limit,
			});
			return {
				domains: data?.domain ?? [],
				total: data?.searchTotal ?? 0,
			};
		},
		enabled: !!cosId && !!query,
		staleTime: 30_000,
		retry: 1,
		refetchOnWindowFocus: false,
	});
};
