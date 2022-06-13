/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const getCosGeneralInformation = async (cosId: string): Promise<any> =>
	fetch(`/service/admin/soap/GetCosRequest`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			Body: {
				GetCosRequest: {
					_jsns: 'urn:zimbraAdmin',
					cos: {
						by: 'id',
						_content: cosId
					}
				}
			}
		})
	});
