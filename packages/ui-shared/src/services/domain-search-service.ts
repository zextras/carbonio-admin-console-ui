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
 * Searches domains through a typed SearchDirectory request, sorted by
 * domain name. An empty keyword lists all domains.
 */
export const getDomainList = async (
	searchKeyWord: string | undefined,
	offset: number,
	limit?: number
): Promise<SearchDomainsResponse> =>
	soapFetch<SearchDirectoryRequest, SearchDomainsResponse>(`SearchDirectory`, {
		_jsns: 'urn:zimbraAdmin',
		limit: limit ?? 50,
		offset: offset || 0,
		sortBy: 'zimbraDomainName',
		sortAscending: '1',
		applyCos: 'false',
		applyConfig: 'false',
		attrs: 'description,zimbraDomainName,zimbraDomainStatus,zimbraId,zimbraDomainType',
		types: 'domains',
		query: {
			_content:
				!!searchKeyWord && searchKeyWord !== '' ? `(|(zimbraDomainName=*${searchKeyWord}*))` : ''
		}
	});
