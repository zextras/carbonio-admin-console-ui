/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const getAccountMembershipRequest = async (id: string): Promise<any> => {
	const request: any = {
		GetAccountMembershipRequest: {
			_jsns: 'urn:zimbraAdmin',
			account: [
				{
					_content: id,
					by: 'id'
				}
			]
		}
	};

	return fetch(`/service/admin/soap/GetAccountMembershipRequest`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			Header: {
				context: {
					_jsns: 'urn:zimbra',
					session: {}
				}
			},
			Body: request
		})
	});
};
