/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/admin-ui-bootstrap';

import { ZX_MOBILE } from '../constants';

export const doStratStopJail = async (action: string, targetServers: string): Promise<any> =>
	postSoapFetchRequest(
		`/service/admin/soap`,
		{
			_jsns: 'urn:zimbraAdmin',
			module: ZX_MOBILE,
			action,
			service_name: 'anti-dos',
			targetServers
		},
		'zextras'
	);
