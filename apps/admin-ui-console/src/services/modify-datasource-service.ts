/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/admin-ui-bootstrapper';

export const modifyDataSource = async (body: {
	id?: string;
	_jsns?: string;
	dataSource?: { id?: string; a?: { n: string; _content?: string }[] };
}): Promise<any> =>
	soapFetch(`ModifyDataSource`, {
		...body
	});
