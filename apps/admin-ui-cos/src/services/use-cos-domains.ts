/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { searchDirectory } from '@zextras/ui-shared';

import { cosQueryKeys } from './cos-query-keys';
import { generateDomainSearchFilterQuery } from './cos-search-utils';

const DOMAIN_ATTRS =
	'description,zimbraDomainName,zimbraDomainStatus,zimbraId,zimbraDomainType,zimbraDomainCOSMaxAccounts,zimbraDomainDefaultCOSId';

export const useCosDomains = (
	cosId: string | undefined,
	searchStr: string,
	offset: number,
	limit: number,
) => {
	return useQuery({
		queryKey: cosQueryKeys.domains(cosId ?? '', searchStr, offset, limit),
		queryFn: async () => {
			const query = generateDomainSearchFilterQuery(searchStr, cosId);
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
		enabled: !!cosId,
		placeholderData: keepPreviousData,
		staleTime: 30_000,
		retry: 1,
		refetchOnWindowFocus: false,
	});
};
