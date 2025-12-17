/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { postSoapFetchRequest } from '@zextras/admin-ui-bootstrap';

export const fetchSoap = async (api: string, body: any): Promise<any> =>
	postSoapFetchRequest(`/service/admin/soap/zextras`, body, `${api}`).then((res: any) =>
		res.Body?.response?.content ? JSON.parse(res.Body.response.content) : res.Body
	);
