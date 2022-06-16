/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const searchDirectory = async (
	attr: string,
	type: string,
	domainName: string,
	query: string,
	offset?: number,
	limit?: number,
	sortBy?: string
): Promise<any> => {
	const request: any = {
		SearchDirectoryRequest: {
			_jsns: 'urn:zimbraAdmin',
			limit: limit || 50,
			offset: offset || 0,
			sortAscending: '1',
			applyCos: 'false',
			applyConfig: 'false',
			attrs: attr,
			types: type
		}
	};
	if (domainName !== '') {
		request.SearchDirectoryRequest.domain = domainName;
	}
	if (query !== '') {
		request.SearchDirectoryRequest.query = query;
	}
	if (sortBy !== '') {
		request.SearchDirectoryRequest.sortBy = sortBy;
	}
	return fetch(`/service/admin/soap/SearchDirectoryRequest`, {
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
