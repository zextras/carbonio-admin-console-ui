/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import { Attribute } from '../../types/attribute';
import { CosResponse } from '../../types/cos';

type CreateCosRequest = {
	_jsns: string;
	name?: { _content: string };
	a?: Array<Attribute>;
};

export const createCos = async (name: string, a?: Array<Attribute>): Promise<CosResponse> => {
	const request: CreateCosRequest = {
		_jsns: 'urn:zimbraAdmin'
	};
	if (name) {
		request.name = { _content: name };
	}
	if (a) {
		request.a = a;
	}
	return soapFetch(`CreateCos`, {
		...request
	});
};
