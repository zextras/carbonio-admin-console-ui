/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { postSoapFetchRequest } from '@zextras/ui-shared';

import type { SendMailRequest, SendMailResponse, ZextrasRawResponse } from '../../types';

export const sendMail = async (api: string, body: SendMailRequest): Promise<SendMailResponse> => {
	const res = await postSoapFetchRequest(
		`/service/admin/soap/zextras`,
		body,
		`${api}`
	);
	const response = res as ZextrasRawResponse;
	return response.Body?.response?.content
		? JSON.parse(response.Body.response.content)
		: response.Body;
};
