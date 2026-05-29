/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { CheckRightRequest, CheckRightResponse } from '../../types';

export const checkRightRequest = async (
	target: string,
	grantee: string,
	right: string
): Promise<CheckRightResponse> => {
	const request: CheckRightRequest = {
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

	return soapFetch<CheckRightRequest, CheckRightResponse>(`CheckRight`, {
		...request
	});
};
