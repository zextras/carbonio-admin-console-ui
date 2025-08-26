/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

export const getQuotaUsage = async (
	domainName: string,
	offset?: number,
	limit?: number,
	propSortBy?: string
): Promise<any> => {
	const request: any = {
		_jsns: 'urn:zimbraAdmin',
		sortBy: propSortBy || 'totalUsed',
		offset: offset || 0,
		limit: limit || 50,
		refresh: '1',
		domain: domainName,
		allServers: '1'
	};
	return soapFetch(`GetQuotaUsage`, {
		...request
	});
};
