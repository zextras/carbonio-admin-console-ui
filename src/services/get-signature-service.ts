/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export const getSingature = async (accountId: string): Promise<any> => {
	const request: any = {
		GetSignatureRequest: {
			_jsns: 'urn:zimbraAdmin'
		}
	};
	return fetch(`/service/admin/soap/GetSignatureRequest`, {
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
