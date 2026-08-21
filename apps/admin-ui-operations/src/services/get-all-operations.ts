/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/ui-shared';

import { type SoapContentResponse } from '../types/operations';

export const getAllOperations = async (): Promise<SoapContentResponse> =>
	postSoapFetchRequest(
		`/service/admin/soap/zextras`,
		{
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxCore',
			action: 'getAllOperations',
			targetServers: 'all_servers'
		},
		'zextras'
	);
