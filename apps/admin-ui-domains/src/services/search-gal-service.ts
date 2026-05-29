/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { SearchGalRequest, SearchGalResponse } from '../../types';

export const searchGal = async (searchKeyWord: string): Promise<SearchGalResponse> =>
	soapFetch<SearchGalRequest, SearchGalResponse>(`SearchGal`, {
		_jsns: 'urn:zimbraAccount',
		limit: '50',
		offset: 0,
		name: searchKeyWord,
		type: 'account'
	});
