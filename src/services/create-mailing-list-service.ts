/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const createMailingList = async (
	dynamic: boolean,
	name: string,
	attribute: Array<any>
): Promise<any> => {
	const request: any = {
		CreateDistributionListRequest: {
			_jsns: 'urn:zimbraAdmin',
			dynamic: !!dynamic,
			name
		}
	};

	if (attribute) {
		request.CreateDistributionListRequest.a = attribute;
	}
	return fetch(`/service/admin/soap/CreateDistributionListRequest`, {
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
