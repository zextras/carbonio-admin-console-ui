/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fetchExternalSoap } from '@zextras/admin-ui-bootstrap';

export const deleteSamlAttributes = async (domain: string, keys?: string): Promise<any> => {
	let url = `/service/extension/zextras_admin/auth/saml/${domain}`;
	if (keys) {
		url += `?keys=${keys}`;
	}
	return fetchExternalSoap(url, {}, '', 'DELETE');
};
