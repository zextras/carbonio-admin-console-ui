/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const getDomainInformation = async (domainId: string): Promise<any> =>
	fetch(`/service/admin/soap/GetDomainRequest`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			Body: {
				GetDomainRequest: {
					_jsns: 'urn:zimbraAdmin',
					domain: {
						by: 'id',
						_content: domainId
					}
				}
			}
		})
	});
