/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const searchDirectory = async (
	domainName: string,
	attr: string,
	type: string
): Promise<any> =>
	fetch(`/service/admin/soap/SearchDirectoryRequest`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			Body: {
				SearchDirectoryRequest: {
					_jsns: 'urn:zimbraAdmin',
					limit: '50',
					offset: 0,
					sortAscending: '1',
					applyCos: 'false',
					applyConfig: 'false',
					domain: domainName,
					attrs: attr,
					types: type,
					query: {}
				}
			}
		})
	});
