/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fetchAccount } from '@zextras/ui-shared';

export const getAccountRequest = async (
	id: string,
	name: string,
	applyCos: number,
	attrs?: Array<string>
) => fetchAccount(id ? 'id' : 'name', id || name, { applyCos, attrs });

export const getAccount = async (accountId: string) => fetchAccount('id', accountId);
