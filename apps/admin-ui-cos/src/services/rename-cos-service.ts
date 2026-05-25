/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

type RenameCosBody = {
	_jsns: string;
	id: { _content: string };
	newName: { _content: string };
};

export const renameCos = async (body: RenameCosBody): Promise<void> =>
	soapFetch(`RenameCos`, {
		...body
	});
