/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const getAllServers = async (): Promise<any> =>
	fetch(`/service/admin/soap/GetAllServersRequest`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			Body: {
				GetAllServersRequest: {
					_jsns: 'urn:zimbraAdmin'
				}
			},
			Header: {
				context: {
					_jsns: 'urn:zimbra',
					session: {}
				}
			}
		})
	});
