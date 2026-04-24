/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getSoapFetchRequest } from '@zextras/ui-shared';

import { FileQuotaResponse } from '../../types/cos';
import { ACCOUNTS, COS } from '../constants';

export const getFileQuotaById = async (accId: string, type?: string): Promise<FileQuotaResponse> => {
	const fetchType = type === COS ? COS : ACCOUNTS;
	const url = `/services/storages/admin/quota/${fetchType}/${accId}`;
	return getSoapFetchRequest(url);
};
