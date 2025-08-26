/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

export const createObjectAttribute = async (
	target?: Array<any>,
	domain?: Array<any>
): Promise<any> => {
	const request: any = {
		_jsns: 'urn:zimbraAdmin'
	};
	if (target) {
		request.target = target;
	}
	if (domain) {
		request.domain = domain;
	}
	return soapFetch(`GetCreateObjectAttrs`, {
		...request
	});
};
