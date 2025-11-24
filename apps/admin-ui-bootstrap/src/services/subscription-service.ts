/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SHELL_APP_ID } from '../constants';
import { postSoapFetchRequest as postSoapFetchRequestFn } from '../network/fetch';

const postSoapFetchRequest = postSoapFetchRequestFn(SHELL_APP_ID);

export const fetchSoap = async (api: string, body: any): Promise<any> =>
	postSoapFetchRequest(`/service/admin/soap/${api}`, body, `${api}`).then((res: any) => res.Body);
