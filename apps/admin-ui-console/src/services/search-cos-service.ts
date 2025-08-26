/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/admin-ui-bootstrapper';

export const getCosList = async (
	searchKeyWord: string,
	limit?: number,
	offset?: number
): Promise<any> =>
	soapFetch(`SearchDirectory`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
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
			_content: !!searchKeyWord && searchKeyWord !== '' ? `(|(cn=*${searchKeyWord}*))` : ''
		}
	});
