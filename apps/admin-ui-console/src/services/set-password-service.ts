/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

export const setPasswordRequest = async (
	resourceId: string,
	newPassword?: string
): Promise<any> => {
	const request: any = {
		_jsns: 'urn:zimbraAdmin',
		id: resourceId,
		newPassword
	};

	return soapFetch(`SetPassword`, {
		...request
	});
};
