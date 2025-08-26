/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

export const getDatasource = async (accountId: string): Promise<any> =>
	soapFetch(`GetDataSources`, {
		_jsns: 'urn:zimbraAdmin',
		id: accountId
	});
