/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

export const modifyServer = async (body: {
	id?: string;
	_jsns?: string;
	a?: Array<Record<string, string>>;
}): Promise<Record<string, unknown>> =>
	soapFetch(`ModifyServer`, {
		...body
	});
