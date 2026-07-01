/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { CreateAccountResponse, SoapAttribute } from '../../types';

export const createAccountRequest = async (

	attr: Record<string, string | number>,
	name: string,
	password: string
): Promise<CreateAccountResponse> => {
	const attrList: Array<SoapAttribute> = [];
	Object.keys(attr).forEach((ele: string) => attrList.push({ n: ele, _content: String(attr[ele]) }));
	const request: {
		_jsns: 'urn:zimbraAdmin';
		name: string;
		password?: string;
		a: Array<SoapAttribute>;
	} = {
		_jsns: 'urn:zimbraAdmin',
		name,
		password,
		a: attrList
	};
	if (!password) {
		delete request.password;
	}

	return soapFetch<typeof request, CreateAccountResponse>(`CreateAccount`, {
		...request
	});
};
