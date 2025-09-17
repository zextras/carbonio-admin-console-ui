/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/admin-ui-bootstrapper';

export const destroyAccount = async (accountId: string): Promise<any> =>
	soapFetch(`DeleteGalSyncAccount`, {
		_jsns: 'urn:zimbraAdmin',
		account: {
			by: 'id',
			_content: accountId
		}
	});
