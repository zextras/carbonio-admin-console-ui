/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/admin-ui-bootstrapper';

import { ZIMBRA_ADMIN_URN } from '../constants';

export const getMobileDeviceDetail = async (
	module: string,
	accountName: string,
	deviceId: string,
	targetServers: string
): Promise<any> =>
	postSoapFetchRequest(
		`/service/admin/soap/zextras`,
		{
			_jsns: ZIMBRA_ADMIN_URN,
			module,
			action: 'getDeviceStatistics',
			accountName,
			deviceId,
			targetServers
		},
		'zextras'
	);
