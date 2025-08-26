/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

export const getAccount = async (accountId: string): Promise<any> =>
	soapFetch(`GetAccount`, {
		_jsns: 'urn:zimbraAdmin',
		account: {
			by: 'id',
			_content: accountId
		}
	});
