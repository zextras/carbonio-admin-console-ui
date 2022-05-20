/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const createObjectAttribute = async (
	target?: Array<any>,
	domain?: Array<any>
): Promise<any> => {
	const request: any = {
		GetCreateObjectAttrsRequest: {
			_jsns: 'urn:zimbraAdmin'
		}
	};
	if (target) {
		request.GetCreateObjectAttrsRequest.target = target;
	}
	if (domain) {
		request.GetCreateObjectAttrsRequest.domain = domain;
	}
	return fetch(`/service/admin/soap/GetCreateObjectAttrsRequest`, {
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
