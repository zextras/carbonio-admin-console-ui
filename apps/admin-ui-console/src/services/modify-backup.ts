/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	fetchExternalSoap
} from '@zextras/carbonio-shell-ui';

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
