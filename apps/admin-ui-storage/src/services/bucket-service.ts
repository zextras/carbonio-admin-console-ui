/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/ui-shared';

import type { ZextrasRawResponse } from '../../types';

declare global {
	interface Window {
		csrfToken: string;
	}
}
export const fetchSoap = async (api: string, body: unknown): Promise<ZextrasRawResponse> =>
	postSoapFetchRequest<unknown, ZextrasRawResponse>(`/service/admin/soap/${api}`, body, api);
