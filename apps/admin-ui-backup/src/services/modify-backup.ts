/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fetchExternalSoap } from '@zextras/ui-shared';

import type { ModifyBackupData, ModifyBackupRequestPayload, ModifyBackupResponse } from '../../types';

export const modifyBackupRequest = async (modifiedData: ModifyBackupData): Promise<ModifyBackupResponse> => {
	const request: ModifyBackupRequestPayload = {};
	Object.keys(modifiedData).forEach((ele: string): void => {
		request[ele] = {
			value: modifiedData[ele],
			configType: 'global'
		};
	});
	return fetchExternalSoap<ModifyBackupRequestPayload, ModifyBackupResponse>(
		`/service/extension/zextras_admin/core/attribute/set`,
		{ ...request },
	);
};
