/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/ui-shared';

import type { AddressBookZextrasSoapResponse } from '../../types';
import { LDAP_ADDRESS_BOOK_SERVICE, ZIMBRA_ADMIN_URN, ZX_ADDRESS_BOOK } from '../constants';

export type AddressBookServiceAction = 'doStartService' | 'doStopService';

export async function doStartStopAddressBookService(
	action: AddressBookServiceAction,
	targetServers: string,
): Promise<AddressBookZextrasSoapResponse> {
	const response = await postSoapFetchRequest<Record<string, unknown>, AddressBookZextrasSoapResponse>(
		'/service/admin/soap/zextras',
		{
			_jsns: ZIMBRA_ADMIN_URN,
			module: ZX_ADDRESS_BOOK,
			action,
			service_name: LDAP_ADDRESS_BOOK_SERVICE,
			targetServers,
		},
		'zextras',
	);

	if (response?.Body?.Fault) {
		throw new Error(response.Body.Fault.Reason?.Text ?? `${action} failed`);
	}

	const content = response?.Body?.response?.content;
	if (content) {
		const parsed = JSON.parse(content) as {
			response?: Record<string, { ok?: boolean; message?: string }>;
			ok?: boolean;
		};
		const serverResult = parsed?.response?.[targetServers];
		if (serverResult && serverResult.ok === false) {
			throw new Error(serverResult.message ?? `${action} failed`);
		}
	}

	return response;
}
