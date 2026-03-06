/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { AccountListDirectoryResponse, SearchDirectoryRequest } from '../../types';
import { ASC } from '../constants';

type AccountListDirectoryParams = {
	attr: string;
	type: string;
	domainName: string;
	query: string;
	offset: number;
	limit: number;
	sortBy?: string;
	sortAscending?: string;
};

export const accountListDirectory = async ({
	attr,
	type,
	domainName,
	query,
	offset,
	limit,
	sortBy,
	sortAscending,
}: AccountListDirectoryParams): Promise<AccountListDirectoryResponse> => {
	const request: SearchDirectoryRequest = {
		_jsns: 'urn:zimbraAdmin',
		offset,
		limit,
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
		request.sortAscending = sortAscending === ASC ? 1 : 0;
	}
	return soapFetch(`SearchDirectory`, {
		...request
	});
};
