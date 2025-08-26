/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

export const distributionListAction = async (dl: JSON, action?: JSON): Promise<any> => {
	const request: any = {
		_jsns: 'urn:zimbraAccount',
		dl
	};
	if (action) {
		request.action = action;
	}

	return soapFetch(`DistributionListAction`, {
		...request
	});
};
