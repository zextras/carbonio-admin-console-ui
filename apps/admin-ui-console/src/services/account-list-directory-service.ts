/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

import { ASC } from '../constants';

export const accountListDirectory = async (
	attr: string,
	type: string,
	domainName: string | undefined,
	query: string,
	offset: number,
	limit: number,
	sortBy?: string,
	sortAscending?: string
): Promise<any> => {
	const request: any = {
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
	return soapFetch(`SearchDirectory`, {
		...request
	});
};

export const getMailboxQuota = async (id: string): Promise<any> => {
	const request: any = {
		_jsns: 'urn:zimbraAdmin',
		mbox: {
			id
		}
	};
	return soapFetch(`GetMailbox`, {
		...request
	});
};
