/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/admin-ui-bootstrap';

export const checkRightRequest = async (
	target: string,
	grantee: string,
	right: string
): Promise<any> => {
	const request: any = {
		_jsns: 'urn:zimbraAdmin',
		target: {
			_content: target,
			type: 'account',
			by: 'name'
		},
		grantee: {
			_content: grantee,
			by: 'name'
		},
		right: {
			_content: right
		}
	};

	return soapFetch(`CheckRight`, {
		...request
	});
};
