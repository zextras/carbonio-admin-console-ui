/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	postSoapFetchRequest
} from '@zextras/carbonio-shell-ui';

import { GET, GET_GLOBAL_CONFIG, ZX_CONFIG } from '../constants';

export const getMobileAntiDosServiceTimeWindow = async (): Promise<any> =>
	postSoapFetchRequest(
		`/service/admin/soap`,
		{
			_jsns: 'urn:zimbraAdmin',
			module: ZX_CONFIG,
			action: GET_GLOBAL_CONFIG,
			command: GET,
			attribute: 'mobileAntiDosServiceTimeWindow'
		},
		'zextras'
	);
