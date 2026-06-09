/*
 * SPDX-FileCPromiseopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '../network/fetch';

export const getCosList = async <T = unknown>(
	searchKeyWord: string,
	limit?: number,
	offset?: number,
): Promise<SearchCosesResponse> =>
	soapFetch<SearchDirectoryRequest, SearchCosesResponse>(`SearchDirectory`, {
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
