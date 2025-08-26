/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { postSoapFetchRequest } from '@zextras/admin-ui-bootstrapper';

export const getSingatures = async (accountId: string): Promise<any> => {
	const request: any = {
		_jsns: 'urn:zimbraAccount'
	};
	return postSoapFetchRequest(
		`/service/admin/soap/GetSignaturesRequest`,
		{
			...request
		},
		'GetSignaturesRequest',
		accountId
	);
};
