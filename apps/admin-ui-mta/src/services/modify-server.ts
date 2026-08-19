/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

export type ModifyServerBody = {
	id?: string;
	_jsns?: string;
	a?: Array<Record<string, string>>;
};

export type ModifyServerResponse = {
	server?: Array<{ a?: Array<{ n: string; _content: string }> }>;
};

export const modifyServer = async (body: ModifyServerBody): Promise<ModifyServerResponse> =>
	soapFetch(`ModifyServer`, {
		...body
	});
