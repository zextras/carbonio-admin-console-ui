/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/ui-shared';

import type { AddressBookSoapResponse } from '../../types';
import { ZIMBRA_ADMIN_URN, ZX_ADDRESS_BOOK } from '../constants';
import { assertZextrasNestedOk } from './address-book-zextras-utils';

type AddAddressBookParams = {
	domain: string;
	account: string;
	folder: string;
};

export async function addAddressBook({
	domain,
	account,
	folder,
}: AddAddressBookParams): Promise<void> {
	const response = await postSoapFetchRequest<
		Record<string, unknown>,
		AddressBookSoapResponse
	>(
		'/service/admin/soap/zextras',
		{
			_jsns: ZIMBRA_ADMIN_URN,
			module: ZX_ADDRESS_BOOK,
			action: 'AddAddressBookCommand',
			class: 'domain',
			domain,
			account,
			folder,
		},
		'zextras',
	);

	assertZextrasNestedOk(response, 'AddAddressBookCommand failed');
}
