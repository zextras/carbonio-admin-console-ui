/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '../network/fetch';

export const flushCache = async (cacheType: string, type?: string, value?: string): Promise<void> =>
	soapFetch(`FlushCache`, {
		_jsns: 'urn:zimbraAdmin',
		cache: {
			type: cacheType,
			allServers: 1,
			...(type && { entry: { _content: value, by: type } }),
		},
	});
