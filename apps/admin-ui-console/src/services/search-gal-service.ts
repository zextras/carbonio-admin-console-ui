/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

export const searchGal = async (searchKeyWord: string): Promise<any> =>
	soapFetch(`SearchGal`, {
		_jsns: 'urn:zimbraAccount',
		limit: '50',
		offset: 0,
		name: searchKeyWord,
		type: 'account'
	});
