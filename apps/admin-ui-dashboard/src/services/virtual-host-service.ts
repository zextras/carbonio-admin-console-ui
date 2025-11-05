/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/admin-ui-bootstrap';

export const IssueCertiRequest = async (
	domain: string | undefined,
	chainType: string
): Promise<any> =>
	soapFetch(`IssueCert`, {
		_jsns: 'urn:zimbraAdmin',
		domain,
		chainType
	});
