/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { postSoapFetchRequest } from '@zextras/ui-shared';

import type { ZextrasRawResponse } from '../../types';

export const fetchSoap = async (api: string, body: unknown): Promise<Record<string, unknown>> =>
	postSoapFetchRequest(`/service/admin/soap/zextras`, body, `${api}`).then((res) => {
		const response = res as ZextrasRawResponse;
		return response.Body?.response?.content ? JSON.parse(response.Body.response.content) : response.Body;
	});
