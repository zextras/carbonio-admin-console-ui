/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const createGalSyncAccount = async (
	name: string,
	folder: string,
	domainName: string,
	server: string,
	account: Array<any>,
	type: string,
	a?: Array<any>
): Promise<any> => {
	const request: any = {
		CreateGalSyncAccountRequest: {
			_jsns: 'urn:zimbraAdmin',
			name,
			folder,
			domain: domainName,
			server,
			type,
			account
		}
	};
	if (a) {
		request.CreateGalSyncAccountRequest.a = a;
	}
	return fetch(`/service/admin/soap/CreateGalSyncAccountRequest`, {
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
