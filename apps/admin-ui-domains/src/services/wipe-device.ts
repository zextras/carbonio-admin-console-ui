/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/admin-ui-bootstrap';

export const wipeDevice = async (
	module: string,
	accountName: string,
	deviceId: string,
	confirm: boolean
): Promise<any> =>
	postSoapFetchRequest(
		`/service/admin/soap/zextras`,
		{
			_jsns: 'urn:zimbraAdmin',
			module,
			action: 'doWipeDevice',
			accountName,
			deviceId,
			confirm
		},
		'zextras'
	);
