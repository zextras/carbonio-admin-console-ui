/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fetchExternalSoap } from '@zextras/ui-shared';

import type { SetCoreAttributesRequest, SetCoreAttributesResponse } from '../../types';

export const setCoreAttributes = async (
	body: SetCoreAttributesRequest
): Promise<SetCoreAttributesResponse> =>
	fetchExternalSoap(`/service/extension/zextras_admin/core/attribute/set`, {
		...body
	});
