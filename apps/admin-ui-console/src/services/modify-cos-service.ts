/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/admin-ui-bootstrapper';

export const modifyCos = async (body: ModifyCosBody): Promise<any> =>
	soapFetch(`ModifyCos`, {
		...body
	});

export interface ModifyCosBody {
	_jsns: string;
	id: {
		_content: string;
	};
	a: Array<{
		n: string;
		_content: string;
	}>;
}
