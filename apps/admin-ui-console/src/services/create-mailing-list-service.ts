/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

export const createMailingList = async (
	dynamic: boolean,
	name: string,
	attribute: Array<any>
): Promise<any> => {
	const request: any = {
		_jsns: 'urn:zimbraAdmin',
		dynamic: !!dynamic,
		name
	};

	if (attribute) {
		request.a = attribute;
	}
	return soapFetch(`CreateDistributionList`, {
		...request
	});
};
