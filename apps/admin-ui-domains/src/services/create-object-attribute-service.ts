/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { GetCreateObjectAttrsRequest, GetCreateObjectAttrsResponse, SoapEntitySelector } from '../../types';

export const createObjectAttribute = async (
	target?: Array<{ type: string; by?: string; _content?: string }>,
	domain?: Array<SoapEntitySelector>
): Promise<GetCreateObjectAttrsResponse> => {
	const request: GetCreateObjectAttrsRequest = {
		_jsns: 'urn:zimbraAdmin'
	};
	if (target) {
		request.target = target;
	}
	if (domain) {
		request.domain = domain;
	}
	return soapFetch<GetCreateObjectAttrsRequest, GetCreateObjectAttrsResponse>(`GetCreateObjectAttrs`, {
		...request
	});
};
