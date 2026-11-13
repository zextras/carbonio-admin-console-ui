/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

export const reSyncGalAccount = async (accountId: string, dataSourceId: string): Promise<any> =>
	soapFetch(`SyncGalAccount`, {
		_jsns: 'urn:zimbraAdmin',
		account: {
			id: accountId,
			datasource: {
				by: 'id',
				fullSync: 1,
				_content: dataSourceId
			}
		}
	});
