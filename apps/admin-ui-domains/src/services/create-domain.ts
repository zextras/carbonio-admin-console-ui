/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { CreateDomainRequest, CreateDomainResponse, SoapAttribute } from '../../types';

export const createDomain = async (name: string, a?: Array<SoapAttribute>): Promise<CreateDomainResponse> => {
	const request: CreateDomainRequest = {
		_jsns: 'urn:zimbraAdmin',
		name
	};
	if (a) {
		request.a = a;
	}
	return soapFetch<CreateDomainRequest, CreateDomainResponse>(`CreateDomain`, {
		...request
	});
};
