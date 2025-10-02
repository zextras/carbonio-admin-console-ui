/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/admin-ui-bootstrap';

export const getDomainList = async (
	searchKeyWord: string | undefined,
	offset: number,
	limit?: number
): Promise<any> =>
	soapFetch(`SearchDirectory`, {
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
