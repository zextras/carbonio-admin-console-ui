/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/admin-ui-bootstrap';

export const countAccount = async (domainName: string): Promise<any> =>
	soapFetch(`CountAccountRequest`, {
		_jsns: 'urn:zimbraAdmin',
		domain: {
			_content: domainName,
			by: 'name'
		}
	});