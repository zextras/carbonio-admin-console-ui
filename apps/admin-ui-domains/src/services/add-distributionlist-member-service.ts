/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { AddDistributionListMemberRequest, objectType, SoapEmptyResponse } from '../../types';

export const addDistributionListMember = async (id: objectType, dlm?: objectType): Promise<SoapEmptyResponse> => {
	const request: AddDistributionListMemberRequest = {
		_jsns: 'urn:zimbraAdmin',
		id
	};
	if (dlm) {
		request.dlm = dlm;
	}

	return soapFetch<AddDistributionListMemberRequest, SoapEmptyResponse>(`AddDistributionListMember`, {
		...request
	});
};
