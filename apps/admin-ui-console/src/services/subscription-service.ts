/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	postSoapFetchRequest
} from '@zextras/carbonio-shell-ui';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const fetchSoap = async (api: string, body: any): Promise<any> =>
	postSoapFetchRequest(`/service/admin/soap/${api}`, body, `${api}`).then((res: any) => res.Body);
