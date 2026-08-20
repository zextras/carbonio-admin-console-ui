/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { getInitializedDomains } from './get-initialized-domains';

/**
 * Initialized domains matching `search`. Pass a debounced search string
 * (useDebouncedValue) so the query key drives refetching; previous results
 * stay visible while the new search resolves.
 */
export const useInitializedDomains = (search: string) =>
	useQuery({
		queryKey: domainQueryKeys.initializedDomains(search),
		queryFn: () => getInitializedDomains({ domainName: search }),
		staleTime: 30_000,
		retry: 1,
		placeholderData: keepPreviousData,
		refetchOnWindowFocus: false,
	});
