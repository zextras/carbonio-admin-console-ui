/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '../network/fetch';

export type SearchCosAttribute = {
	n: string;
	_content: string;
	c?: boolean;
};

export type SearchCosEntry = {
	id: string;
	name: string;
	a: Array<SearchCosAttribute>;
};

export type SearchCosResponse = {
	cos?: Array<SearchCosEntry>;
	more?: boolean;
	searchTotal?: number;
};

export const getCosList = async <T = SearchCosResponse>(
	searchKeyWord: string,
	limit?: number,
	offset?: number,
): Promise<T> =>
	soapFetch<unknown, T>(`SearchDirectory`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
		},
		_jsns: 'urn:zimbraAdmin',
		limit: limit ?? 50,
		offset: offset ?? 0,
		sortBy: 'cn',
		sortAscending: '1',
		applyCos: 'false',
		applyConfig: 'false',
		attrs: 'cn,description',
		types: 'coses',
		query: {
			_content: !!searchKeyWord && searchKeyWord !== '' ? `(|(cn=*${searchKeyWord}*))` : '',
		},
	});
