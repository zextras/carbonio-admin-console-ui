/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export const getSingatures = async (accountId: string): Promise<any> => {
	const request: any = {
		GetSignaturesRequest: {
			_jsns: 'urn:zimbraAccount'
		}
	};
	return fetch(`/service/admin/soap/GetSignaturesRequest`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			Header: {
				context: {
					_jsns: 'urn:zimbra',
					session: {},
					account: {
						by: 'id',
						_content: accountId
					}
				}
			},
			Body: request
		})
	});
};
