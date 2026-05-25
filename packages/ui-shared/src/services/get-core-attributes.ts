/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fetchExternalSoap } from '../network/fetch';

export type CoreAttributeRequest = {
	configType: string;
	configName: Array<string | undefined>;
	attrName: Array<string>;
};

export type CoreAttributeValue = {
	value: string;
};

export type GetCoreAttributesResponse = {
	attributes: Record<string, Array<CoreAttributeValue>>;
};

export const getCoreAttributes = async (
	body: Array<CoreAttributeRequest>,
): Promise<GetCoreAttributesResponse> =>
	fetchExternalSoap(`/service/extension/zextras_admin/core/attributes/get`, [...body]);
