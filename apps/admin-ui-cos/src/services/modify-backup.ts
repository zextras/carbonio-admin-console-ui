/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fetchExternalSoap } from '@zextras/admin-ui-bootstrap';

export const modifyBackupRequest = async (modifiedData: any): Promise<any> => {
	const request: any = {};
	Object.keys(modifiedData).forEach((ele: any): void => {
		request[ele] = {
			value: modifiedData[ele],
			configType: 'global'
		};
	});
	return fetchExternalSoap(`/service/extension/zextras_admin/core/attribute/set`, {
		...request
	});
};
