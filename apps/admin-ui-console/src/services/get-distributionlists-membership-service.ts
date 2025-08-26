/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

export const getDistributionListMembership = async (dlId: string): Promise<any> => {
	const request: any = {
		_jsns: 'urn:zimbraAdmin',
		dl: {
			by: 'id',
			_content: dlId
		}
	};

	return soapFetch(`GetDistributionListMembership`, {
		...request
	});
};
