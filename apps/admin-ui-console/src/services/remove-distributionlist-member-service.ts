/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

export const removeDistributionListMember = async (id: JSON, dlm: JSON): Promise<any> => {
	const request: any = {
		_jsns: 'urn:zimbraAdmin',
		id
	};

	if (dlm) {
		request.dlm = dlm;
	}

	return soapFetch(`RemoveDistributionListMember`, {
		...request
	});
};
