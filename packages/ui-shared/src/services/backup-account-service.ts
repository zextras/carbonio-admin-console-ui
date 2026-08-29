/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fetchExternalSoap, getSoapFetchRequest } from '../network/fetch';

export type BackupAccountItem = {
	name?: string;
	id?: string;
	[key: string]: unknown;
};

type ServerBackupResponse = {
	response?: {
		accounts?: Array<BackupAccountItem>;
		maxPage?: number;
	};
};

type BackupAccountsApiResponse = {
	accounts?: Array<BackupAccountItem>;
	maxPage?: number;
	all_server?: { error?: { message?: string } };
	[key: string]: unknown;
};

export type ParsedBackupAccounts = {
	accounts: Array<BackupAccountItem>;
	maxPage: number;
};

function isServerBackupResponse(value: unknown): value is ServerBackupResponse {
	return Boolean(value && typeof value === 'object' && 'response' in value);
}

/**
 * Parses a getBackupAccounts response, merging the account lists of every
 * server in a multiserver response and taking the highest maxPage.
 */
export function parseBackupAccountsResponse(data: BackupAccountsApiResponse): ParsedBackupAccounts {
	if (data.accounts) {
		return {
			accounts: data.accounts,
			maxPage: data.maxPage ?? 0,
		};
	}

	const accounts: Array<BackupAccountItem> = [];
	const maxPages: Array<number> = [];

	Object.values(data).forEach((value) => {
		if (!isServerBackupResponse(value)) {
			return;
		}
		if (value.response?.accounts) {
			accounts.push(...value.response.accounts);
		}
		if (value.response?.maxPage !== undefined && value.response.maxPage >= 0) {
			maxPages.push(value.response.maxPage);
		}
	});

	return {
		accounts,
		maxPage: maxPages.length > 0 ? Math.max(...maxPages) : (data.maxPage ?? 0),
	};
}

export type GetBackupAccountsParams = {
	page: number;
	pageSize: number;
	domains: string;
	filter: string;
	legalHold?: boolean;
};

export type GetBackupAccountsResult = ParsedBackupAccounts & { allServerError?: string };

/**
 * Lists the backup (deleted) accounts of a domain, optionally filtered by
 * text and restricted to legal-hold accounts. A multiserver `all_server`
 * error is surfaced alongside the parsed data.
 */
export const getBackupAccounts = async ({
	page,
	pageSize,
	domains,
	filter,
	legalHold,
}: GetBackupAccountsParams): Promise<GetBackupAccountsResult> => {
	const legalHoldParam = legalHold === undefined ? '' : `&legalHold=${legalHold}`;
	const url = `/service/extension/zextras_admin/backup/getBackupAccounts?page=${page}&pageSize=${pageSize}&domains=${domains}&filter=${filter}${legalHoldParam}`;
	const data = await getSoapFetchRequest<BackupAccountsApiResponse>(url);
	return {
		...parseBackupAccountsResponse(data),
		allServerError: data.all_server?.error?.message,
	};
};

export type RestoreAccountBody = {
	srcAccountName: string;
	dstAccountName?: string;
	date?: number | string;
	obeyHSM?: boolean;
	notificationMails?: Array<string>;
	undelete?: boolean;
	undeleteStartDate?: number | null;
};

export type RestoreAccountRawResponse = {
	operationId?: string;
	status?: number;
	message?: string;
	error?: { message?: string; details?: { cause?: string } };
	response?: { operationId?: string };
	Body?: { response?: { content?: string; operationId?: string } };
};

/**
 * Starts a restore of a backup account onto a (new) account, targeting the
 * given mail server.
 */
export const doRestoreOnNewAccount = (
	body: RestoreAccountBody,
	targetServers: string
): Promise<RestoreAccountRawResponse> =>
	fetchExternalSoap<RestoreAccountBody, RestoreAccountRawResponse>(
		`/service/extension/zextras_admin/backup/doRestoreOnNewAccount?targetServers=${targetServers}`,
		{ ...body }
	);
