/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const createAccountRequest = async (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	attr: Array<any>,
	name: string,
	password: string
): Promise<any> => {
	const attrList: { n: string; _content: string }[] = [];
	Object.keys(attr).map((ele: any) => attrList.push({ n: ele, _content: attr[ele] }));
	const request: any = {
		CreateAccountRequest: {
			_jsns: 'urn:zimbraAdmin',
			name,
			password,
			a: attrList
		}
	};

	return fetch(`/service/admin/soap/CreateAccountRequest`, {
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
