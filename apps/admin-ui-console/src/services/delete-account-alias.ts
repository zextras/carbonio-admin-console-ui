/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export const deleteAccountAliasRequest = async (id: string, alias: string): Promise<any> => {
	const request: any = {
		_jsns: 'urn:zimbraAdmin',
		id,
		alias: alias.trim()
	};

	return soapFetch(`RemoveAccountAlias`, {
		...request
	});
};
