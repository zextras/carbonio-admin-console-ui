/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/ui-shared';

import type {
	AddressBookEntry,
	AddressBookFolder,
	AddressBookSoapResponse,
} from '../../types';
import { ZIMBRA_ADMIN_URN, ZX_ADDRESS_BOOK } from '../constants';
import { assertZextrasOk } from './address-book-zextras-utils';

type ListAddressBooksParams = {
	domain: string;
};

type RawAddressBook = {
	account?: string;
	accountId?: string;
	folderIds?: string;
	folders?: Array<AddressBookFolder>;
};

export function normalizeAddressBookFolders(
	folderIds?: string,
	folders?: Array<AddressBookFolder>,
): Array<AddressBookFolder> {
	if (Array.isArray(folders) && folders.length > 0) {
		return folders.map((folder) => ({
			id: folder.id,
			name: folder.name,
			isShared: folder.isShared === true,
		}));
	}

	if (!folderIds || folderIds.trim() === '') {
		return [];
	}

	return folderIds
		.split(',')
		.map((id) => id.trim())
		.filter(Boolean)
		.map((id) => ({
			id,
			name: id === 'all' ? 'all' : id,
			isShared: false,
		}));
}

export async function listAddressBooks({
	domain,
}: ListAddressBooksParams): Promise<Array<AddressBookEntry>> {
	const response = await postSoapFetchRequest<
		Record<string, unknown>,
		AddressBookSoapResponse
	>(
		'/service/admin/soap/zextras',
		{
			_jsns: ZIMBRA_ADMIN_URN,
			module: ZX_ADDRESS_BOOK,
			action: 'ListAddressBookCommand',
			class: 'domain',
			domain,
		},
		'zextras',
	);

	const parsed = assertZextrasOk(response, 'ListAddressBookCommand failed');
	const books = (
		parsed?.response as { 'address books'?: Array<RawAddressBook> } | undefined
	)?.['address books'];

	if (!Array.isArray(books)) {
		return [];
	}

	return books.map((book) => {
		const folderIds = typeof book.folderIds === 'string' ? book.folderIds : undefined;
		return {
			account: book.account ?? '',
			accountId: book.accountId ?? '',
			folderIds,
			folders: normalizeAddressBookFolders(folderIds, book.folders),
		};
	});
}
