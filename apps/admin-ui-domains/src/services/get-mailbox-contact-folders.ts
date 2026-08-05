/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/ui-shared';

import type { AddressBookFolder, AddressBookZextrasSoapResponse } from '../../types';
import { ZIMBRA_ADMIN_URN, ZX_ADDRESS_BOOK } from '../constants';
import { assertZextrasOk } from './address-book-zextras-utils';

type GetMailboxContactFoldersParams = {
	account: string;
};

export async function getMailboxContactFolders({
	account,
}: GetMailboxContactFoldersParams): Promise<Array<AddressBookFolder>> {
	const response = await postSoapFetchRequest<
		Record<string, unknown>,
		AddressBookZextrasSoapResponse
	>(
		'/service/admin/soap/zextras',
		{
			_jsns: ZIMBRA_ADMIN_URN,
			module: ZX_ADDRESS_BOOK,
			action: 'GetMailboxContactFoldersCommand',
			account,
		},
		'zextras',
	);

	const parsed = assertZextrasOk(response, 'GetMailboxContactFoldersCommand failed');
	const folders = (parsed?.response as { folders?: Array<AddressBookFolder> } | undefined)
		?.folders;

	if (!Array.isArray(folders)) {
		return [];
	}

	return folders.map((folder) => ({
		id: folder.id,
		name: folder.name,
		isShared: folder.isShared === true,
	}));
}
