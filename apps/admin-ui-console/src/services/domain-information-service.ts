/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/admin-ui-bootstrap';

export const getDomainInformation = async (domainId: string, applyConfig = 1): Promise<any> =>
	soapFetch(`GetDomain`, {
		_jsns: 'urn:zimbraAdmin',
		domain: {
			by: 'id',
			_content: domainId
		},
		applyConfig
	});
