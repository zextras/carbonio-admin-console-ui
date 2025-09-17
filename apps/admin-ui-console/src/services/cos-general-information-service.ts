/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/admin-ui-bootstrapper';

export const getCosGeneralInformation = async (cosId: string): Promise<any> =>
	soapFetch(`GetCos`, {
		_jsns: 'urn:zimbraAdmin',
		cos: {
			by: 'id',
			_content: cosId
		}
	});

export type CosA = {
	n: string;
	_content: string;
};
export type GetCosResponse = {
	cos: {
		name: string;
		id: string;
		a: CosA[];
	}[];
};
