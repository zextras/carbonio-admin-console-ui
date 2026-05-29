/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { GetDistributionListRequest, GetDistributionListResponse } from '../../types';

export const getDistributionList = async (
	dlId: string,
	dlName: string,
	offset?: number,
	limit?: number
): Promise<GetDistributionListResponse> => {
	const request: GetDistributionListRequest = {
		_jsns: 'urn:zimbraAdmin',
		offset: offset || 0,
		limit: limit || 0
	};
	if (dlId) {
		request.dl = {
			by: 'id',
			_content: dlId
		};
	}
	if (dlName) {
		request.name = dlName;
	}
	return soapFetch<GetDistributionListRequest, GetDistributionListResponse>(`GetDistributionList`, {
		...request
	});
};
