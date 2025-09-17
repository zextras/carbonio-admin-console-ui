/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fetchExternalSoap } from '@zextras/admin-ui-bootstrapper';

export const updateSamlAttributes = async (domain: string, body: JSON): Promise<any> =>
	fetchExternalSoap(
		`/service/extension/zextras_admin/auth/saml/${domain}`,
		{
			...body
		},
		'',
		'PUT'
	);
