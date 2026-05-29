
/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fetchExternalSoap } from '@zextras/ui-shared';

export const getCoreAttributes = async (body: Array<unknown>): Promise<Record<string, unknown>> =>
	fetchExternalSoap(`/service/extension/zextras_admin/core/attributes/get`, [...body]);

