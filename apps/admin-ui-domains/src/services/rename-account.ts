/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { RenameAccountRequest, RenameAccountResponse } from '../../types';

export const renameAccountRequest = async (id: string, newName: string): Promise<RenameAccountResponse> => {
	const request: RenameAccountRequest = {
		_jsns: 'urn:zimbraAdmin',
		id,
		newName
	};

	return soapFetch<RenameAccountRequest, RenameAccountResponse>(`RenameAccount`, {
		...request
	});
};
