/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/admin-ui-bootstrapper';

export const getDelegateAuthRequest = async (id: string, name?: string): Promise<any> => {
	const request: any = {
		_jsns: 'urn:zimbraAdmin',
		account: [
			{
				_content: id || name,
				by: id ? 'id' : 'name'
			}
		]
	};

	return soapFetch(`DelegateAuth`, {
		...request
	});
};
