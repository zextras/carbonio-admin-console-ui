/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const modifyCalendarResource = async (resourceId: string, a?: any[]): Promise<any> => {
	const request: any = {
		ModifyCalendarResourceRequest: {
			_jsns: 'urn:zimbraAdmin',
			id: resourceId
		}
	};
	if (a) {
		request.ModifyCalendarResourceRequest.a = a;
	}
	return fetch(`/service/admin/soap/ModifyCalendarResourceRequest`, {
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
