/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fetchExternalSoap } from '@zextras/ui-shared';

export const setCoreAttributes = async (body: Record<string, unknown>): Promise<void> =>
	fetchExternalSoap(`/service/extension/zextras_admin/core/attribute/set`, {
		...body
	});
