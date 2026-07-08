/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { GetMailboxRequest, GetMailboxResponse, SearchDirectoryRequest, SearchDirectoryResponse } from '../../types';
import { ASC } from '../constants';

export interface AccountListDirectoryParams {
	attr: string;
	type: string;
	domainName: string | undefined;
	query: string;
	offset: number;
	limit: number;
	sortBy?: string;
	sortAscending?: string;
}

export const accountListDirectory = async ({
	attr,
	type,
	domainName,
	query,
	offset,
	limit,
	sortBy,
	sortAscending
}: AccountListDirectoryParams): Promise<SearchDirectoryResponse<'account' | 'dl' | 'calresource'>> => {
	const request: SearchDirectoryRequest = {
		_jsns: 'urn:zimbraAdmin',
		offset,
		limit,
		applyCos: 'false',
		applyConfig: 'false',
		attrs: attr,
		types: type
	};
	if (domainName && domainName !== '') {
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
	return soapFetch<SearchDirectoryRequest, SearchDirectoryResponse<'account' | 'dl' | 'calresource'>>(`SearchDirectory`, {
		...request
	});
};

export const getMailboxQuota = async (id: string): Promise<GetMailboxResponse> => {
	const request: GetMailboxRequest = {
		_jsns: 'urn:zimbraAdmin',
		mbox: {
			id
		}
	};
	return soapFetch<GetMailboxRequest, GetMailboxResponse>(`GetMailbox`, {
		...request
	});
};
