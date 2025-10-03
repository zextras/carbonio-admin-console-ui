/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/admin-ui-bootstrap';

export const getAllAdminAccountRequest = async (): Promise<any> => {
	const request: any = {
		_jsns: 'urn:zimbraAdmin'
	};

	return soapFetch(`GetAllAdminAccounts`, {
		...request
	});
};
