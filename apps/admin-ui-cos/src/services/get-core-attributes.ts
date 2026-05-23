
/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fetchExternalSoap } from '@zextras/ui-shared';

import { GetCoreAttributesResponse } from '../../types/cos';

export type CoreAttributeRequest = {
	configType: string;
	configName: Array<string | undefined>;
	attrName: Array<string>;
};

export const getCoreAttributes = async (
	body: Array<CoreAttributeRequest>
): Promise<GetCoreAttributesResponse> =>
	fetchExternalSoap(`/service/extension/zextras_admin/core/attributes/get`, [...body]);
