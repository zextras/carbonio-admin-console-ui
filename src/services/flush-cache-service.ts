/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

export const flushCache = async (cacheType: string): Promise<any> =>
	soapFetch(`FlushCache`, {
		_jsns: 'urn:zimbraAdmin',
		cache: {
			type: cacheType,
			allServers: 1
		}
	});
