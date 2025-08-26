/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getSoapFetchRequest } from '@zextras/admin-ui-bootstrapper';

export const getSamlConfig = async (domain: string, raw?: boolean): Promise<any> => {
	let url = `/service/extension/zextras_admin/auth/saml/${domain}`;
	if (raw) {
		url += `?raw=${raw}`;
	}
	return getSoapFetchRequest(url);
};
