/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/ui-shared';

import type { AddressBookSoapResponse } from '../../types';
import {
	ADDRESS_BOOK_SERVICE_ENABLED,
	SET,
	ZIMBRA_ADMIN_URN,
	ZX_CONFIG,
	ZX_CONFIG_GLOBAL_ACTION,
} from '../constants';
import { assertZextrasOk } from './address-book-zextras-utils';

export async function setAddressBookServiceEnabled(
	enabled: boolean,
): Promise<AddressBookSoapResponse> {
	const response = await postSoapFetchRequest<
		Record<string, unknown>,
		AddressBookSoapResponse
	>(
		'/service/admin/soap/zextras',
		{
			_jsns: ZIMBRA_ADMIN_URN,
			module: ZX_CONFIG,
			action: ZX_CONFIG_GLOBAL_ACTION,
			command: SET,
			attribute: ADDRESS_BOOK_SERVICE_ENABLED,
			value: enabled,
		},
		'zextras',
	);

	assertZextrasOk(response, 'set addressBookServiceEnabled failed');
	return response;
}
