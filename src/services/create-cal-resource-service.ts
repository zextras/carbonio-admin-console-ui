/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const createResource = async (
	name: string,
	passowrd: string,
	a?: Array<any>
): Promise<any> => {
	const request: any = {
		CreateCalendarResourceRequest: {
			_jsns: 'urn:zimbraAdmin',
			name,
			passowrd
		}
	};
	if (a) {
		request.CreateCalendarResourceRequest.a = a;
	}
	return fetch(`/service/admin/soap/CreateCalendarResourceRequest`, {
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
