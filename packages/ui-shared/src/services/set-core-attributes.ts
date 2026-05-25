/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fetchExternalSoap } from '../network/fetch';

export const setCoreAttributes = async <T = void>(
	body: Record<string, unknown>,
): Promise<T> =>
	fetchExternalSoap<Record<string, unknown>, T>(
		`/service/extension/zextras_admin/core/attribute/set`,
		{ ...body },
	);
