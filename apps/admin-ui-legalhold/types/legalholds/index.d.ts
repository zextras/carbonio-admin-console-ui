/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactElement } from 'react';

export type ZimbraAttribute = {
	n: string;
	_content: string;
};

export type LegalHolds = {
	name: string;
	id: string;
	status: string;
};

export type BackupAccountItem = {
	name: string;
	id: string;
	status: string;
	legalHold: string;
	serverName: string;
	creationTimestamp: number;
	deletedTimestamp?: number;
};

export type DirectoryAccount = {
	name: string;
	id: string;
	a: Array<ZimbraAttribute>;
	type?: string;
};

export type AccountListDirectoryResponse = {
	account?: Array<DirectoryAccount>;
	dl?: Array<DirectoryAccount>;
	more?: boolean;
	searchTotal?: number;
};

export type ServerBackupResponse = {
	response?: {
		accounts?: Array<BackupAccountItem>;
		maxPage?: number;
	};
};

export type BackupAccountsApiResponse = {
	all_server?: { error?: { message?: string } };
	accounts?: Array<BackupAccountItem>;
	maxPage?: number;
	[serverName: string]:
		| ServerBackupResponse
		| { error?: { message?: string } }
		| Array<BackupAccountItem>
		| number
		| undefined;
};

export type LegalHoldOperationResponse = {
	accounts?: Array<BackupAccountItem>;
	[serverName: string]:
		| ServerBackupResponse
		| Array<BackupAccountItem>
		| undefined;
};

export type SetUnsetLegalHoldResponse = LegalHoldOperationResponse;

export type RestoreRawResponse = {
	operationId?: string;
	error?: { message?: string };
	message?: string;
	Body?: { response?: { content?: string } };
	response?: { operationId?: string };
};

export type GetAccountResponse = {
	account?: Array<DirectoryAccount>;
};

export type SnackbarConfig = {
	key: string;
	severity: 'error' | 'success' | 'info' | 'warning';
	label: string;
	autoHideTimeout: number;
	hideButton: boolean;
	replace: boolean;
};

export type TableRow = {
	id: string;
	columns: Array<string | ReactElement>;
};

export type ApiError = {
	message?: string;
	error?: string;
};

export type SearchDirectoryRequest = {
	_jsns: string;
	offset: number;
	limit: number;
	applyCos: string;
	applyConfig: string;
	attrs: string;
	types: string;
	domain?: string;
	query?: string;
	sortBy?: string;
	sortAscending?: number;
};
