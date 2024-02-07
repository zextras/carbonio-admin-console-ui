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

export const doStratStopJail = async (action: string, targetServers: string): Promise<any> =>
	postSoapFetchRequest(
		`/service/admin/soap`,
		{
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxMobile',
			action,
			service_name: 'anti-dos',
			targetServers
		},
		'zextras'
	);
