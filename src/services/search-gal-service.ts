/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const searchGal = async (searchKeyWord: string): Promise<any> =>
	fetch(`/service/admin/soap/SearchGalRequest`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			Body: {
				SearchGalRequest: {
					_jsns: 'urn:zimbraAccount',
					limit: '50',
					offset: 0,
					name: searchKeyWord,
					type: 'account'
				}
			}
		})
	});
