/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { GetDistributionListMembershipRequest, GetDistributionListMembershipResponse } from '../../types';

export const getDistributionListMembership = async (dlId: string): Promise<GetDistributionListMembershipResponse> => {
	const request: GetDistributionListMembershipRequest = {
		_jsns: 'urn:zimbraAdmin',
		dl: {
			by: 'id',
			_content: dlId
		}
	};

	return soapFetch<GetDistributionListMembershipRequest, GetDistributionListMembershipResponse>(`GetDistributionListMembership`, {
		...request
	});
};
