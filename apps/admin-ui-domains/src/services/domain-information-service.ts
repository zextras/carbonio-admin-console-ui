/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { GetDomainRequest, GetDomainResponse } from '../../types';

export const getDomainInformation = async (domainId: string, applyConfig = 1): Promise<GetDomainResponse> =>
	soapFetch<GetDomainRequest, GetDomainResponse>(`GetDomain`, {
		_jsns: 'urn:zimbraAdmin',
		domain: {
			by: 'id',
			_content: domainId
		},
		applyConfig
	});
