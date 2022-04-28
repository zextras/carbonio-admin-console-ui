/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const getAccount = async (accountId: string): Promise<any> =>
	fetch(`/service/admin/soap/GetAccountRequest`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			Body: {
				GetAccountRequest: {
					_jsns: 'urn:zimbraAdmin',
					account: {
						by: 'id',
						_content: accountId
					}
				}
			}
		})
	});
