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

type RawMailboxContactFolder = {
	id?: string | number;
	name?: string;
	mounted?: boolean;
	isShared?: boolean;
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
	const folders = (parsed?.response as { folders?: Array<RawMailboxContactFolder> } | undefined)
		?.folders;

	if (!Array.isArray(folders)) {
		return [];
	}

	return folders
		.filter((folder) => folder.id != null)
		.map((folder) => ({
			id: folder.id as string | number,
			name: folder.name ?? String(folder.id),
			isShared: folder.isShared === true || folder.mounted === true,
		}));
}
