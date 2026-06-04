/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type {
	RemoveDistributionListMemberRequest,
	SoapEmptyResponse,
	SoapNamedContent
} from '../../types';

export const removeDistributionListMember = async (
	id: SoapNamedContent | string,
	dlm: SoapNamedContent | string
): Promise<SoapEmptyResponse> => {
	const request: RemoveDistributionListMemberRequest = {
		_jsns: 'urn:zimbraAdmin',
		id
	};

	if (dlm) {
		request.dlm = dlm;
	}

	return soapFetch<RemoveDistributionListMemberRequest, SoapEmptyResponse>(`RemoveDistributionListMember`, {
		...request
	});
};
