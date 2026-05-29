/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { ModifyDistributionListRequest, ModifyDistributionListResponse, SoapAttribute } from '../../types';

export const modifyDistributionList = async (dlId: string, a?: Array<SoapAttribute>): Promise<ModifyDistributionListResponse> => {
	const request: ModifyDistributionListRequest = {
		_jsns: 'urn:zimbraAdmin',
		id: dlId
	};
	if (a) {
		request.a = a;
	}
	return soapFetch<ModifyDistributionListRequest, ModifyDistributionListResponse>(`ModifyDistributionList`, {
		...request
	});
};
