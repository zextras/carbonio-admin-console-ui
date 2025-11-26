/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/admin-ui-bootstrap';

export const flushCache = async (cacheType: string, type?: string, value?: string): Promise<any> =>
	soapFetch(`FlushCache`, {
		_jsns: 'urn:zimbraAdmin',
		cache: {
			type: cacheType,
			allServers: 1,
			...(type && { entry: { _content: value, by: type } })
		}
	});
