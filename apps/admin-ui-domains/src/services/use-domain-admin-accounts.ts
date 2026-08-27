/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Attribute } from '../../types';
import { useAccountListDirectory } from './use-account-list-directory';

/** LDAP query matching global admins and delegated admins (excluding globals). */
export const ADMIN_ACCOUNTS_QUERY =
	'(|(&(zimbraIsAdminAccount=TRUE))(&(zimbraIsDelegatedAdminAccount=TRUE)(!(zimbraIsAdminAccount=TRUE))))';

export const ADMIN_ACCOUNTS_ATTRS =
	'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraIsSystemAccount,zimbraIsExternalVirtualAccount,zimbraCreateTimestamp,zimbraLastLogonTimestamp,zimbraMailQuota,zimbraNotes,mail';

export type DirectoryAccountEntry = {
	id: string;
	name?: string;
	a?: Array<Attribute>;
};

/** A directory account with its attributes flattened onto the entry itself. */
export type FlattenedAccount = { id: string; name: string } & Record<string, unknown>;

export type DomainAdminAccount = {
  id: string;
  name: string;
  item: FlattenedAccount;
};

export type DomainAdminAccounts = {
	accounts: Array<DomainAdminAccount>;
	total: number;
};

/**
 * Merges a `mail` attribute value with the value already collected so far:
 * repeated `mail` attributes accumulate into an array.
 */
function mergeMailAttribute(current: unknown, mail: string): Array<string> {
	if (Array.isArray(current)) {
		return [...current, mail];
	}
	if (current === undefined) {
		return [mail];
	}
	return [current as string, mail];
}

/**
 * Flattens the SOAP `a` attribute list onto a copy of the entry: repeated
 * `mail` attributes are collected into an array, every other attribute keeps
 * its last value.
 */
export function toDomainAdminAccount(entry: DirectoryAccountEntry): DomainAdminAccount {
	const item: Record<string, unknown> = { ...entry, name: entry.name ?? '' };
	(entry.a ?? []).forEach((attr) => {
		if (attr.n === 'mail') {
			item.mail = mergeMailAttribute(item.mail, attr._content);
		} else {
			item[attr.n] = attr._content;
		}
	});
	return { id: entry.id, name: entry.name ?? '', item: item as FlattenedAccount };
}

/** Projects a SearchDirectory response into the admin-accounts view model. */
export function selectDomainAdminAccounts(res: unknown): DomainAdminAccounts {
	const body = (res ?? {}) as { account?: Array<DirectoryAccountEntry>; searchTotal?: number };
	return {
		accounts: (body.account ?? []).map(toDomainAdminAccount),
		total: body.searchTotal ?? 0,
	};
}

/**
 * Admin and delegated-admin accounts of a domain, server-paginated via
 * SearchDirectory. Reuses the module's shared directory query (cached,
 * `keepPreviousData`) so the data is shared with the other screens.
 */
export const useDomainAdminAccounts = ({
	domainName,
	offset,
	limit,
}: {
	domainName: string | undefined;
	offset: number;
	limit: number;
}) =>
	useAccountListDirectory(
		{
			attr: ADMIN_ACCOUNTS_ATTRS,
			type: 'accounts',
			domainName,
			query: ADMIN_ACCOUNTS_QUERY,
			offset,
			limit,
			select: selectDomainAdminAccounts,
		},
		domainName !== undefined,
	);
