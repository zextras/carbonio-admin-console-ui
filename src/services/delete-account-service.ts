/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const deleteAccount = async (accountId: string): Promise<any> =>
	fetch(`/service/admin/soap/DeleteAccountRequest`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			Body: {
				DeleteAccountRequest: {
					_jsns: 'urn:zimbraAdmin',
					id: accountId
				}
			}
		})
	});
