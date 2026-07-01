/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getSoapFetchRequest } from '@zextras/ui-shared';

import type { FileQuotaUsageResponse } from '../../types';

export const getQuotaUsageAdvance = async (
	domainName: string,
	offset?: number,
	limit?: number,
	sortBy?: string
): Promise<FileQuotaUsageResponse> => {
	const sortType = sortBy || 'totalUsed';
	const url = `/services/storages/admin/quota/accounts?domain=${domainName}&offset=${offset ?? 0
		}&limit=${limit ?? 50}&sortBy=${sortType}`;
	return getSoapFetchRequest(url);
};
