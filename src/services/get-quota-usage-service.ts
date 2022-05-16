/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const getQuotaUsage = async (
	domainName: string,
	offset?: number,
	limit?: number,
	propSortBy?: string
): Promise<any> => {
	const request: any = {
		GetQuotaUsageRequest: {
			_jsns: 'urn:zimbraAdmin',
			sortBy: propSortBy || 'totalUsed',
			offset: offset || 0,
			limit: limit || 50,
			refresh: '1',
			domain: domainName,
			allServers: '1'
		}
	};
	return fetch(`/service/admin/soap/GetQuotaUsageRequest`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			Body: request
		})
	});
};
