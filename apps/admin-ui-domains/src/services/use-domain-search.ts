/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { getDomainList } from './search-domain-service';

type UseDomainSearchOptions = {
	searchQuery: string;
	limit: number;
	offset: number;
	enabled?: boolean;
};

export const useDomainSearch = ({
	searchQuery,
	limit,
	offset,
	enabled = true,
}: UseDomainSearchOptions) => {
	return useQuery({
		queryKey: domainQueryKeys.searchList(searchQuery, limit, offset),
		queryFn: () => getDomainList(searchQuery || undefined, offset, limit),
		enabled,
		staleTime: 30_000,
		retry: 1,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
	});
};
