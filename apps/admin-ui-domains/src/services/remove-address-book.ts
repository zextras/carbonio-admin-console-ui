/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/ui-shared';

import type { AddressBookSoapResponse } from '../../types';
import { ZIMBRA_ADMIN_URN, ZX_ADDRESS_BOOK } from '../constants';
import { assertZextrasNestedOk } from './address-book-zextras-utils';

type RemoveAddressBookParams = {
	domain: string;
	account: string;
	folder: string;
};

export async function removeAddressBook({
	domain,
	account,
	folder,
}: RemoveAddressBookParams): Promise<void> {
	const response = await postSoapFetchRequest<
		Record<string, unknown>,
		AddressBookSoapResponse
	>(
		'/service/admin/soap/zextras',
		{
			_jsns: ZIMBRA_ADMIN_URN,
			module: ZX_ADDRESS_BOOK,
			action: 'RemoveAddressBookCommand',
			class: 'domain',
			domain,
			account,
			folder,
		},
		'zextras',
	);

	assertZextrasNestedOk(response, 'RemoveAddressBookCommand failed');
}
