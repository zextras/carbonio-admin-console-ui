/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import { CosResponse } from '../../types/cos';

export const modifyCos = async (body: ModifyCosBody): Promise<CosResponse> =>
	soapFetch(`ModifyCos`, {
		...body
	});

export type ModifyCosBody = {
	_jsns: string;
	id: {
		_content: string;
	};
	a: Array<{
		n: string;
		_content: string;
	}>;
};
