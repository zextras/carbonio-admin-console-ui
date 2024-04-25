/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	getSoapFetchRequest
} from '@zextras/carbonio-shell-ui';

export const getFileQuotaByAccount = async (accId: string): Promise<any> => {
	const url = `/services/storages/admin/quota/accounts/${accId}`;
	return getSoapFetchRequest(url);
};
