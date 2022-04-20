/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const deleteDomain = async (domainId: string): Promise<any> =>
	fetch(`/service/admin/soap/DeleteDomainRequest`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			Body: {
				DeleteDomainRequest: {
					_jsns: 'urn:zimbraAdmin',
					id: domainId
				}
			}
		})
	});
