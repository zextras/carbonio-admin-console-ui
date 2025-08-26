/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

export const modifyDistributionList = async (dlId: string, a?: any[]): Promise<any> => {
	const request: any = {
		_jsns: 'urn:zimbraAdmin',
		id: dlId
	};
	if (a) {
		request.a = a;
	}
	return soapFetch(`ModifyDistributionList`, {
		...request
	});
};
