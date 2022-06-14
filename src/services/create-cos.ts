/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const createCos = async (name: string, a?: Array<any>): Promise<any> => {
	const request: any = {
		CreateCosRequest: {
			_jsns: 'urn:zimbraAdmin'
		}
	};
	if (name) {
		request.CreateCosRequest.name = { _content: name };
	}
	if (a) {
		request.CreateCosRequest.a = a;
	}
	return fetch(`/service/admin/soap/CreateCosRequest`, {
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
