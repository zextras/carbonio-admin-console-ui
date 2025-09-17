/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/admin-ui-bootstrapper';

import { GET, GET_GLOBAL_CONFIG, ZX_CONFIG } from '../constants';

export const getMobileAntiDosServiceMaxRequests = async (): Promise<any> =>
	postSoapFetchRequest(
		`/service/admin/soap`,
		{
			_jsns: 'urn:zimbraAdmin',
			module: ZX_CONFIG,
			action: GET_GLOBAL_CONFIG,
			command: GET,
			attribute: 'mobileAntiDosServiceMaxRequests'
		},
		'zextras'
	);
