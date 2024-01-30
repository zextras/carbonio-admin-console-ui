/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

export const searchDirectory = async (
	attr: string,
	type: string,
	domainName: string,
	query: string,
	offset?: number,
	limit?: number,
	sortBy?: string,
	sortAscending?: string
): Promise<any> => {
	const request: any = {
		_jsns: 'urn:zimbraAdmin',
		limit: limit ?? 50,
		offset: offset || 0,
		sortAscending: '1',
		applyCos: 'false',
		applyConfig: 'false',
		attrs: attr,
		types: type
	};
	if (domainName !== '') {
		request.domain = domainName;
	}
	if (query !== '') {
		request.query = query;
	}
	if (sortBy !== '') {
		request.sortBy = sortBy;
	}
	if (sortAscending !== '') {
		request.sortAscending = sortAscending === 'asc' ? 1 : 0;
	}
	return soapFetch(`SearchDirectory`, {
		...request
	});
};
