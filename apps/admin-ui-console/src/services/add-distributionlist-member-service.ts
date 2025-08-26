/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/admin-ui-bootstrapper';

import { objectType } from '../../types';

export const addDistributionListMember = async (id: objectType, dlm?: objectType): Promise<any> => {
	const request: any = {
		_jsns: 'urn:zimbraAdmin',
		id
	};
	if (dlm) {
		request.dlm = dlm;
	}

	return soapFetch(`AddDistributionListMember`, {
		...request
	});
};
