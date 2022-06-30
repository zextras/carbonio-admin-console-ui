/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const getCalResource = async (resourceId: string): Promise<any> =>
	fetch(`/service/admin/soap/GetCalResourceRequest`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			Body: {
				GetCalResourceRequest: {
					_jsns: 'urn:zimbraAdmin',
					account: {
						by: 'id',
						_content: resourceId
					}
				}
			}
		})
	});
