/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/ui-shared';

import type { AddressBookFolder, AddressBookZextrasSoapResponse } from '../../types';
import { ZIMBRA_ADMIN_URN, ZX_ADDRESS_BOOK } from '../constants';
import {
	assertZextrasOk,
	getFirstZextrasServerResult,
} from './address-book-zextras-utils';

type GetExposedAddressBookFoldersParams = {
	domain: string;
	account: string;
};

type RawExposedFolder = {
	id?: string | number;
	name?: string;
	mounted?: boolean;
	isShared?: boolean;
};

type RawExposedAccountFolders = {
	account?: string;
	accountId?: string;
	folders?: Array<RawExposedFolder>;
};

function mapRawExposedFolder(folder: RawExposedFolder): AddressBookFolder {
	return {
		id: folder.id as string | number,
		name: folder.name ?? String(folder.id),
		isShared: folder.isShared === true || folder.mounted === true,
	};
}

function isAccountWrapper(item: RawExposedAccountFolders | RawExposedFolder): boolean {
	return Array.isArray((item as RawExposedAccountFolders).folders);
}

export function parseExposedAddressBookFolders(
	serverResponse: Record<string, unknown> | undefined,
	account: string,
): Array<AddressBookFolder> {
	const items = (serverResponse as { folders?: Array<RawExposedAccountFolders | RawExposedFolder> } | undefined)
		?.folders;

	if (!Array.isArray(items) || items.length === 0) {
		return [];
	}

	const looksLikeAccountWrappers = items.some(isAccountWrapper);

	if (!looksLikeAccountWrappers) {
		return (items as Array<RawExposedFolder>)
			.filter((folder) => folder.id != null)
			.map(mapRawExposedFolder);
	}

	const accounts = items as Array<RawExposedAccountFolders>;
	const match =
		accounts.find((entry) => entry.account === account) ??
		(accounts.length === 1 ? accounts[0] : undefined);

	if (!match || !Array.isArray(match.folders)) {
		return [];
	}

	return match.folders.filter((folder) => folder.id != null).map(mapRawExposedFolder);
}

export async function getExposedAddressBookFolders({
	domain,
	account,
}: GetExposedAddressBookFoldersParams): Promise<Array<AddressBookFolder>> {
	const response = await postSoapFetchRequest<
		Record<string, unknown>,
		AddressBookZextrasSoapResponse
	>(
		'/service/admin/soap/zextras',
		{
			_jsns: ZIMBRA_ADMIN_URN,
			module: ZX_ADDRESS_BOOK,
			action: 'GetAddressBookCommand',
			class: 'domain',
			domain,
			account,
			exposed: true,
		},
		'zextras',
	);

	const parsed = assertZextrasOk(response, 'GetAddressBookCommand failed');
	const serverResult = getFirstZextrasServerResult(parsed);
	const payload = serverResult?.response ?? parsed?.response;

	return parseExposedAddressBookFolders(payload, account);
}
