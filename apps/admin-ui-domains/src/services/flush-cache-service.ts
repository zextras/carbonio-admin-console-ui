/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { FlushCacheRequest, SoapEmptyResponse } from '../../types';

export const flushCache = async (cacheType: string, type?: string, value?: string): Promise<SoapEmptyResponse> =>
	soapFetch<FlushCacheRequest, SoapEmptyResponse>(`FlushCache`, {
		_jsns: 'urn:zimbraAdmin',
		cache: {
			type: cacheType,
			allServers: 1,
			...(type && { entry: { _content: value, by: type } })
		}
	});
