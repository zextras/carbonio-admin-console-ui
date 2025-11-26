/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { postSoapFetchRequest } from '@zextras/admin-ui-bootstrap';

type SoapResponse = {
	Body?: {
		response?: {
			content?: string;
		};
	};
};

export const sendMail = async (api: string, body: unknown): Promise<unknown> => {
	const res: SoapResponse = await postSoapFetchRequest(`/service/admin/soap/zextras`, body, `${api}`);
	return res.Body?.response?.content ? JSON.parse(res.Body.response.content) : res.Body;
};
