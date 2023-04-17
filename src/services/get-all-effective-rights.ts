/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

export const getAllEffectiveRigthsRequest = async (userName: string): Promise<any> => {
	const request: any = {
		_jsns: 'urn:zimbraAdmin',
		grantee: {
			by: 'name',
			_content: userName
		}
	};

	return soapFetch(`GetAllEffectiveRights`, {
		...request
	});
};
