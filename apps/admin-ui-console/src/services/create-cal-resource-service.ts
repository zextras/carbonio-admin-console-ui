/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

export const createResource = async (
	name: string,
	passowrd: string,
	a?: Array<any>
): Promise<any> => {
	const request: any = {
		_jsns: 'urn:zimbraAdmin',
		name,
		passowrd
	};
	if (a) {
		request.a = a;
	}
	return soapFetch(`CreateCalendarResource`, {
		...request
	});
};
