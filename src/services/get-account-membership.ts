/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

import { DISPLAYNAME } from '../constants';

export const getAccountMembershipRequest = async (id: string, attrs?: string): Promise<any> => {
	const request: any = {
		_jsns: 'urn:zimbraAdmin',
		attrs: attrs ?? DISPLAYNAME,
		account: [
			{
				_content: id,
				by: 'id'
			}
		]
	};

	return soapFetch(`GetAccountMembership`, {
		...request
	});
};
