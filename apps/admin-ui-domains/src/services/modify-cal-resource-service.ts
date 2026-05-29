/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { ModifyCalendarResourceRequest, ModifyCalendarResourceResponse, SoapAttribute } from '../../types';

export const modifyCalendarResource = async (resourceId: string, a?: Array<SoapAttribute>): Promise<ModifyCalendarResourceResponse> => {
	const request: ModifyCalendarResourceRequest = {
		_jsns: 'urn:zimbraAdmin',
		id: resourceId
	};
	if (a) {
		request.a = a;
	}
	return soapFetch<ModifyCalendarResourceRequest, ModifyCalendarResourceResponse>(`ModifyCalendarResource`, {
		...request
	});
};
