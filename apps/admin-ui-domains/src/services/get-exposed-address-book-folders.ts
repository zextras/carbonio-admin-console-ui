/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/ui-shared';

import type { AddressBookFolder, AddressBookSoapResponse } from '../../types';
import { ZIMBRA_ADMIN_URN, ZX_ADDRESS_BOOK } from '../constants';
import {
	assertZextrasOk,
	getFirstZextrasServerResult,
} from './address-book-zextras-utils';

type GetAddressBookFoldersParams = {
	domain: string;
	account: string;
	exposed: boolean;
};

type GetAccountAddressBookFoldersParams = {
	domain: string;
	account: string;
};

type RawAddressBookFolder = {
	id?: string | number;
	name?: string;
	mounted?: boolean;
	isShared?: boolean;
};

type RawAddressBookAccountFolders = {
	account?: string;
	accountId?: string;
	folders?: Array<RawAddressBookFolder>;
};

function mapRawAddressBookFolder(folder: RawAddressBookFolder): AddressBookFolder {
	return {
		id: folder.id as string | number,
		name: folder.name ?? String(folder.id),
		isShared: folder.isShared === true || folder.mounted === true,
	};
}

function isAccountWrapper(item: RawAddressBookAccountFolders | RawAddressBookFolder): boolean {
	return Array.isArray((item as RawAddressBookAccountFolders).folders);
}

export function parseAddressBookFolders(
	serverResponse: Record<string, unknown> | undefined,
	account: string,
): Array<AddressBookFolder> {
	const items = (
		serverResponse as { folders?: Array<RawAddressBookAccountFolders | RawAddressBookFolder> } | undefined
	)?.folders;

	if (!Array.isArray(items) || items.length === 0) {
		return [];
	}

	const looksLikeAccountWrappers = items.some(isAccountWrapper);

	if (!looksLikeAccountWrappers) {
		return (items as Array<RawAddressBookFolder>)
			.filter((folder) => folder.id != null)
			.map(mapRawAddressBookFolder);
	}

	const accounts = items as Array<RawAddressBookAccountFolders>;
	const match =
		accounts.find((entry) => entry.account === account) ??
		(accounts.length === 1 ? accounts[0] : undefined);

	if (!match || !Array.isArray(match.folders)) {
		return [];
	}

	return match.folders.filter((folder) => folder.id != null).map(mapRawAddressBookFolder);
}

export async function getAddressBookFolders({
	domain,
	account,
	exposed,
}: GetAddressBookFoldersParams): Promise<Array<AddressBookFolder>> {
	const response = await postSoapFetchRequest<
		Record<string, unknown>,
		AddressBookSoapResponse
	>(
		'/service/admin/soap/zextras',
		{
			_jsns: ZIMBRA_ADMIN_URN,
			module: ZX_ADDRESS_BOOK,
			action: 'GetAddressBookCommand',
			class: 'domain',
			domain,
			account,
			exposed,
		},
		'zextras',
	);

	const parsed = assertZextrasOk(response, 'GetAddressBookCommand failed');
	const serverResult = getFirstZextrasServerResult(parsed);
	const payload = serverResult?.response ?? parsed?.response;

	return parseAddressBookFolders(payload, account);
}

export async function getExposedAddressBookFolders({
	domain,
	account,
}: GetAccountAddressBookFoldersParams): Promise<Array<AddressBookFolder>> {
	return getAddressBookFolders({ domain, account, exposed: true });
}

export async function getUnexposedAddressBookFolders({
	domain,
	account,
}: GetAccountAddressBookFoldersParams): Promise<Array<AddressBookFolder>> {
	return getAddressBookFolders({ domain, account, exposed: false });
}
