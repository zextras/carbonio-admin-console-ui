/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { accountListDirectory } from './account-list-directory-service';
import { domainQueryKeys } from './domain-query-keys';

export type AccountListDirectoryParams = {
	attr: string;
	type: string;
	domainName?: string;
	query: string;
	offset: number;
	limit: number;
	sortBy?: string;
	sortAscending?: string;
	/** Consumer-specific projection over the raw SearchDirectory response. */
	select?: (res: any) => any;
};

export type AccountListEntry = {
	id: string;
	name: string;
	[key: string]: unknown;
};

/**
 * Directory entries of a SearchDirectory response. Distribution-list entries
 * take precedence over account entries when both are present (the endpoint
 * fills `dl` for distributionlists searches).
 */
export function parseAccountListDirectory(res: any): Array<AccountListEntry> {
	if (res?.dl?.length) {
		return res.dl;
	}
	return (res?.account ?? []) as Array<AccountListEntry>;
}

/**
 * SearchDirectory query. Pass a debounced search string in `query`
 * (useDebouncedValue) so the query key drives refetching; previous results
 * stay visible while the next search resolves. Pass `enabled: false` to
 * skip fetching (e.g. while the search text is too short).
 */
export const useAccountListDirectory = (
	params: AccountListDirectoryParams,
	enabled = true,
) =>
	useQuery({
		queryKey: domainQueryKeys.accountListDirectory.search(params),
		queryFn: () =>
			accountListDirectory(
				params.attr,
				params.type,
				params.domainName,
				params.query,
				params.offset,
				params.limit,
				params.sortBy,
				params.sortAscending,
			),
		select: params.select ?? parseAccountListDirectory,
		enabled,
		staleTime: 30_000,
		retry: 1,
		placeholderData: keepPreviousData,
		refetchOnWindowFocus: false,
	});
