/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

export const createAccountRequest = async (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	attr: Array<any>,
	name: string,
	password: string
): Promise<any> => {
	const attrList: { n: string; _content: string }[] = [];
	Object.keys(attr).map((ele: any) => attrList.push({ n: ele, _content: attr[ele] }));
	const request: any = {
		_jsns: 'urn:zimbraAdmin',
		name,
		password,
		a: attrList
	};
	if (!password) {
		delete request.password;
	}

	return soapFetch(`CreateAccount`, {
		...request
	});
};
