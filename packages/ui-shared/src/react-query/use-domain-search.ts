/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { keepPreviousData, useQuery } from '@tanstack/react-query';

type UseDomainSearchOptions<T> = {
	searchQuery: string;
	limit: number;
	offset: number;
	enabled?: boolean;
	queryFn: () => Promise<T>;
};

export function useDomainSearch<T>({
	searchQuery,
	limit,
	offset,
	enabled = true,
	queryFn,
}: UseDomainSearchOptions<T>) {
	return useQuery({
		queryKey: ['domain', 'search-list', searchQuery, limit, offset],
		queryFn,
		enabled,
		staleTime: 30_000,
		retry: 1,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
	});
}
