/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import {
	domainListDirectory,
	type DomainListDirectoryParams,
} from './domain-list-directory-service';
import { domainQueryKeys } from './domain-query-keys';

export type DomainListEntry = {
	id: string;
	name: string;
	a?: Array<{ n: string; _content: string }>;
	[key: string]: unknown;
};

export type DomainListData = {
	domains: Array<DomainListEntry>;
	total: number;
};

export function parseDomainListDirectory(res: unknown): Array<DomainListEntry> {
	const response = res as { domain?: Array<DomainListEntry> } | undefined;
	return response?.domain ?? [];
}

export function selectDomainListWithTotal(res: unknown): DomainListData {
	const response = res as { searchTotal?: number } | undefined;
	return {
		domains: parseDomainListDirectory(res),
		total: response?.searchTotal ?? 0,
	};
}

export const useDomainListDirectory = (
	params: DomainListDirectoryParams,
	enabled = true,
) =>
	useQuery({
		queryKey: domainQueryKeys.domainListDirectory.search(params),
		queryFn: () => domainListDirectory(params),
		select: selectDomainListWithTotal,
		enabled,
		staleTime: 30_000,
		retry: 1,
		placeholderData: keepPreviousData,
		refetchOnWindowFocus: false,
	});
