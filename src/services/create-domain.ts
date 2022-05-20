/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const createDomain = async (name: string, a?: Array<any>): Promise<any> => {
	const request: any = {
		CreateDomainRequest: {
			_jsns: 'urn:zimbraAdmin',
			name
		}
	};
	if (a) {
		request.CreateDomainRequest.a = a;
	}
	return fetch(`/service/admin/soap/CreateDomainRequest`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			Body: request
		})
	});
};
