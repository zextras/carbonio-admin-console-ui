/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getSoapFetchRequest } from '../network/fetch';

const ACCOUNTS = 'accounts';
const COS = 'cos';

export type FileQuotaResponse = {
	limit: string;
};

export const getFileQuotaById = async (
	accId: string,
	type?: string,
): Promise<FileQuotaResponse> => {
	const fetchType = type === COS ? COS : ACCOUNTS;
	const url = `/services/storages/admin/quota/${fetchType}/${accId}`;
	return getSoapFetchRequest(url);
};
