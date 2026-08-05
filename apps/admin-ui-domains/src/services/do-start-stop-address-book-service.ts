/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/ui-shared';

import type { AddressBookZextrasSoapResponse } from '../../types';
import { LDAP_ADDRESS_BOOK_SERVICE, ZIMBRA_ADMIN_URN, ZX_ADDRESS_BOOK } from '../constants';
import { assertZextrasOk } from './address-book-zextras-utils';

export type AddressBookServiceAction = 'doStartService' | 'doStopService';

export async function doStartStopAddressBookService(
	action: AddressBookServiceAction,
): Promise<AddressBookZextrasSoapResponse> {
	const response = await postSoapFetchRequest<Record<string, unknown>, AddressBookZextrasSoapResponse>(
		'/service/admin/soap/zextras',
		{
			_jsns: ZIMBRA_ADMIN_URN,
			module: ZX_ADDRESS_BOOK,
			action,
			service_name: LDAP_ADDRESS_BOOK_SERVICE,
		},
		'zextras',
	);

	assertZextrasOk(response, `${action} failed`);
	return response;
}
