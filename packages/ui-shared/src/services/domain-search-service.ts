/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '../network/fetch';

export type SoapAttribute = {
	n: string;
	_content: string;
};

export type SoapEntity = {
	id: string;
	name: string;
	a?: Array<SoapAttribute>;
};

type SearchDirectoryResponse<K extends string, T = SoapEntity> = {
	[key in K]?: Array<T>;
} & {
	more: boolean;
	searchTotal: number;
	_jsns: string;
};

export type SearchDomainsResponse = SearchDirectoryResponse<'domain', SoapEntity>;

type SearchDirectoryRequest = {
	_jsns: 'urn:zimbraAdmin';
	limit?: number;
	offset?: number;
	sortBy?: string;
	sortAscending?: string | number;
	applyCos?: string;
	applyConfig?: string;
	attrs?: string;
	types?: string;
	domain?: string;
	query?: string | { _content: string };
};

/**
 * Builds a SearchDirectory LDAP query from an optional domain-name keyword
 * and zero or more zimbraDomainStatus values.
 */
export function buildDomainDirectoryQuery(
	searchKeyword: string | undefined,
	statusFilters: Array<string> = [],
): string {
	const parts: Array<string> = [];
	const keyword = searchKeyword?.trim() ?? '';
	if (keyword !== '') {
		parts.push(`(|(zimbraDomainName=*${keyword}*))`);
	}
	if (statusFilters.length === 1) {
		parts.push(`(zimbraDomainStatus=${statusFilters[0]})`);
	} else if (statusFilters.length > 1) {
		parts.push(`(|${statusFilters.map((status) => `(zimbraDomainStatus=${status})`).join('')})`);
	}
	if (parts.length === 0) {
		return '';
	}
	if (parts.length === 1) {
		return parts[0];
	}
	return `(&${parts.join('')})`;
}

/**
 * Searches domains through a typed SearchDirectory request, sorted by
 * domain name. An empty keyword and no status filters lists all domains.
 */
export const getDomainList = async (
	searchKeyWord: string | undefined,
	offset: number,
	limit?: number,
	sortAscending: string | number = '1',
	statusFilters: Array<string> = [],
): Promise<SearchDomainsResponse> =>
	soapFetch<SearchDirectoryRequest, SearchDomainsResponse>(`SearchDirectory`, {
		_jsns: 'urn:zimbraAdmin',
		limit: limit ?? 50,
		offset: offset || 0,
		sortBy: 'zimbraDomainName',
		sortAscending,
		applyCos: 'false',
		applyConfig: 'false',
		attrs: 'description,zimbraDomainName,zimbraDomainStatus,zimbraId,zimbraDomainType',
		types: 'domains',
		query: {
			_content: buildDomainDirectoryQuery(searchKeyWord, statusFilters),
		},
	});
