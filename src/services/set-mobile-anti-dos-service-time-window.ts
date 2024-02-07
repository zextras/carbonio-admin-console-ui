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

export const setAntiDosServiceTimeWindow = async (value: number): Promise<any> =>
	postSoapFetchRequest(
		`/service/admin/soap`,
		{
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxConfig',
			action: 'set_global_config',
			command: 'set',
			attribute: 'mobileAntiDosServiceTimeWindow',
			value
		},
		'zextras'
	);
