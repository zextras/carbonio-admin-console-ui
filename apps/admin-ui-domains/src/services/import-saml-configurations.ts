/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fetchExternalSoap } from '@zextras/admin-ui-bootstrap';

export const importSamlConfig = async (
	domain: string,
	url: string,
	allowUnsecure: boolean
): Promise<any> =>
	fetchExternalSoap(
		`/service/extension/zextras_admin/auth/saml/${domain}?url=${url}&allowUnsecure=${allowUnsecure}`,
		{}
	);
