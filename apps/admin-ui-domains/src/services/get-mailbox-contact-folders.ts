/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/ui-shared';

import type { AddressBookFolder, AddressBookZextrasSoapResponse } from '../../types';
import { ZIMBRA_ADMIN_URN, ZX_ADDRESS_BOOK } from '../constants';
import { assertZextrasServerOk } from './address-book-zextras-utils';

type GetMailboxContactFoldersParams = {
	account: string;
	targetServers: string;
};

export async function getMailboxContactFolders({
	account,
	targetServers,
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
			targetServers,
		},
		'zextras',
	);

	const parsed = assertZextrasServerOk(
		response,
		targetServers,
		'GetMailboxContactFoldersCommand failed',
	);
	const serverResponse = parsed?.response?.[targetServers]?.response as
		| { folders?: Array<AddressBookFolder> }
		| undefined;
	const folders = serverResponse?.folders;

	if (!Array.isArray(folders)) {
		return [];
	}

	return folders.map((folder) => ({
		id: folder.id,
		name: folder.name,
		isShared: folder.isShared === true,
	}));
}
