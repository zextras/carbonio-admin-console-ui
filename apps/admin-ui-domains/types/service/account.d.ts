/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { SoapAttribute, SoapEntity, SoapEntitySelector } from './common';

// ============================================================
// Account service types
// ============================================================

export type CreateAccountRequest = {
	_jsns: 'urn:zimbraAdmin';
	name: string;
	password?: string;
	a?: Array<SoapAttribute>;
};

export type CreateAccountResponse = {
	account: Array<SoapEntity>;
};

export type GetAccountRequest = {
	_jsns: 'urn:zimbraAdmin';
	account: SoapEntitySelector | Array<SoapEntitySelector>;
	applyCos?: number | string;
	attrs?: string;
};

export type GetAccountResponse = {
	account: Array<SoapEntity>;
};

export type ModifyAccountRequest = {
	_jsns: 'urn:zimbraAdmin';
	id: string;
	a: Array<SoapAttribute>;
};

export type ModifyAccountResponse = {
	account: Array<SoapEntity>;
};

export type DeleteAccountRequest = {
	_jsns: 'urn:zimbraAdmin';
	id: string;
};

export type RenameAccountRequest = {
	_jsns: 'urn:zimbraAdmin';
	id: string;
	newName: string;
};

export type RenameAccountResponse = {
	account: Array<SoapEntity>;
};

export type GetAccountMembershipRequest = {
	_jsns: 'urn:zimbraAdmin';
	attrs?: string;
	account: Array<SoapEntitySelector>;
};

export type GetAccountMembershipResponse = {
	dl?: Array<SoapEntity & { via?: string }>;
};

export type AddAccountAliasRequest = {
	_jsns: 'urn:zimbraAdmin';
	id: string;
	alias: string;
};

export type RemoveAccountAliasRequest = {
	_jsns: 'urn:zimbraAdmin';
	id: string;
	alias: string;
};

export type SetPasswordRequest = {
	_jsns: 'urn:zimbraAdmin';
	id: string;
	newPassword?: string;
};

export type DelegateAuthRequest = {
	_jsns: 'urn:zimbraAdmin';
	account: Array<SoapEntitySelector>;
};

export type DelegateAuthResponse = {
	authToken: Array<{ _content: string }>;
	lifetime: number;
};

export type GetMailboxRequest = {
	_jsns: 'urn:zimbraAdmin';
	mbox: { id: string };
};

export type GetMailboxResponse = {
	mbox: Array<{
		mbxid: number;
		s: number;
	}>;
};

// ============================================================
// Session service types
// ============================================================

export type GetSessionsRequest = {
	_jsns: 'urn:zimbraAdmin';
	type: string;
	offset?: number;
	sortBy?: string;
	refresh?: number;
};

export type SessionInfo = {
	zid: string;
	name: string;
	sid: string;
	cd: number;
	ld: number;
	s?: number;
};

export type GetSessionsResponse = {
	total: number;
	more: boolean;
	s?: Array<SessionInfo>;
};

export type EndSessionRequest = {
	_jsns: 'urn:zimbraAccount';
	sessionId: string;
	logoff: number;
	all: number;
	excludeCurrent: number;
};

// ============================================================
// Quota usage service types
// ============================================================

export type GetQuotaUsageRequest = {
	_jsns: 'urn:zimbraAdmin';
	sortBy?: string;
	offset?: number;
	limit?: number;
	refresh?: string;
	domain?: string;
	allServers?: string;
};

export type QuotaUsageAccount = {
	name: string;
	id: string;
	used: number;
	limit: number;
};

export type GetQuotaUsageResponse = {
	account?: Array<QuotaUsageAccount>;
	more: boolean;
	searchTotal: number;
};

// ============================================================
// File Quota types (REST API)
// ============================================================

export type FileQuotaUsageAccount = {
	accountId: string;
	totalUsed: number;
	limit?: number;
};

export type FileQuotaUsageResponse = {
	accounts?: Array<FileQuotaUsageAccount>;
	total?: number;
};

export type FileQuotaResponse = {
	limit?: number;
};

// ============================================================
// Restore / Delete account types
// ============================================================

export type RestoreDeleteAccountRequest = {
	accounts: Array<{
		name: string;
		id: string;
		serverName: string;
	}>;
};

export type RestoreDeleteAccountResponse = {
	error?: {
		details?: {
			cause?: string;
		};
		message?: string;
	};
	operationId?: string;
	status?: number;
};

// ============================================================
// SearchDirectory
// ============================================================

export type SearchDirectoryRequest = {
	_jsns: 'urn:zimbraAdmin';
	limit?: number;
	offset?: number;
	sortBy?: string;
	sortAscending?: string | number;
	applyCos?: string;
	applyConfig?: string;
	attrs?: string;
	types?: string;
	domain?: string;
	query?: string | { _content: string };
};
