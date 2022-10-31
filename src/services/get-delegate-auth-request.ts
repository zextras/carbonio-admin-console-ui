/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

export const getDelegateAuthRequest = async (id: string): Promise<any> => {
	const request: any = {
		_jsns: 'urn:zimbraAdmin',
		account: [
			{
				_content: id,
				by: 'id'
			}
		]
	};

	return soapFetch(`DelegateAuth`, {
		...request
	});
};
