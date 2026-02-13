/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/admin-ui-bootstrap';

export const set2faPolicies = async (
	domain: string | undefined,
	service: string,
	trustedDevice: number | undefined,
	trustedIpRange: string | undefined
): Promise<any> =>
	postSoapFetchRequest(
		`/service/admin/soap/zextras`,
		{
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxAuth',
			action: 'setPolicy',
			level: domain === '' ? 'global' : 'domain',
			domain,
			service,
			trustedDevice,
			trustedIpRange
		},
		'zextras'
	);
