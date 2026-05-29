/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/ui-shared';

import type { ZextrasRawResponse } from '../../types';

export const suspendDevice = async (
	module: string,
	accountName: string,
	deviceId: string
): Promise<ZextrasRawResponse> =>
	postSoapFetchRequest(
		`/service/admin/soap/zextras`,
		{
			_jsns: 'urn:zimbraAdmin',
			module,
			action: 'doSuspendDeviceSync',
			accountName,
			deviceId
		},
		'zextras'
	);
