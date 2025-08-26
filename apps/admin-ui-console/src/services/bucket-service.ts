/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/admin-ui-bootstrapper';

declare global {
	interface Window {
		csrfToken: string;
	}
}
export const fetchSoap = async (api: string, body: unknown): Promise<any> =>
	postSoapFetchRequest(`/service/admin/soap/${api}`, body, api);
