/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const deleteCOS = async (cosId: string): Promise<any> =>
	fetch(`/service/admin/soap/DeleteCosRequest`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			Body: {
				DeleteCosRequest: {
					_jsns: 'urn:zimbraAdmin',
					id: { _content: cosId }
				}
			}
		})
	});
