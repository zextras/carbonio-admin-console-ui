/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type {
	DistributionListActionRequest,
	SoapEmptyResponse,
	SoapEntitySelector
} from '../../types';

export const distributionListAction = async (
	dl: SoapEntitySelector,
	action?: DistributionListActionRequest['action']
): Promise<SoapEmptyResponse> => {
	const request: DistributionListActionRequest = {
		_jsns: 'urn:zimbraAccount',
		dl
	};
	if (action) {
		request.action = action;
	}

	return soapFetch<DistributionListActionRequest, SoapEmptyResponse>(`DistributionListAction`, {
		...request
	});
};
