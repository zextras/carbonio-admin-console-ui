/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/admin-ui-bootstrap';

import { SET, SET_GLOBAL_CONFIG, ZX_CONFIG } from '../constants';

export const setAntiDosServiceTimeWindow = async (value: number): Promise<any> =>
	postSoapFetchRequest(
		`/service/admin/soap`,
		{
			_jsns: 'urn:zimbraAdmin',
			module: ZX_CONFIG,
			action: SET_GLOBAL_CONFIG,
			command: SET,
			attribute: 'mobileAntiDosServiceTimeWindow',
			value
		},
		'zextras'
	);
