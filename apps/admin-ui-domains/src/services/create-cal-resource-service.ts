/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { CreateCalendarResourceRequest, CreateCalendarResourceResponse, SoapAttribute } from '../../types';

export const createResource = async (
	name: string,
	passowrd: string,
	a?: Array<SoapAttribute>
): Promise<CreateCalendarResourceResponse> => {
	const request: CreateCalendarResourceRequest = {
		_jsns: 'urn:zimbraAdmin',
		name,
		password: passowrd
	};
	if (a) {
		request.a = a;
	}
	return soapFetch<CreateCalendarResourceRequest, CreateCalendarResourceResponse>(`CreateCalendarResource`, {
		...request
	});
};
