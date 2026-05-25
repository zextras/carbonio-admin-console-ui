/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '../network/fetch';

export type DirectoryAttribute = {
	n: string;
	_content: string;
};

export type DirectoryEntry = {
	name: string;
	id: string;
	isExternal?: boolean;
	dynamic?: boolean;
	targetName?: string;
	a: Array<DirectoryAttribute>;
	zimbraIsSystemAccount?: string;
};

export type SearchDomainDirectories = {
	account: Array<DirectoryEntry>;
	dl: Array<DirectoryEntry>;
	alias: Array<DirectoryEntry>;
	calresource: Array<DirectoryEntry>;
	more: boolean;
	searchTotal: number;
};

export type DomainDirectories = {
	account: Array<DirectoryEntry>;
	dl: Array<DirectoryEntry>;
	alias: Array<DirectoryEntry>;
	calresource: Array<DirectoryEntry>;
};

export const searchDirectory = async <T = unknown>(
	attr: string,
	type: string,
	domainName: string,
	query: string,
	offset?: number,
	limit?: number,
	sortBy?: string,
	sortAscending?: string,
): Promise<T> => {
	const request: Record<string, string | number | undefined> = {
		_jsns: 'urn:zimbraAdmin',
		limit: limit ?? 50,
		offset: offset || 0,
		sortAscending: '1',
		applyCos: 'false',
		applyConfig: 'false',
		attrs: attr,
		types: type,
	};
	if (domainName !== '') {
		request.domain = domainName;
	}
	if (query !== '') {
		request.query = query;
	}
	if (sortBy !== '') {
		request.sortBy = sortBy;
	}
	if (sortAscending !== '') {
		request.sortAscending = sortAscending === 'asc' ? 1 : 0;
	}
	return soapFetch(`SearchDirectory`, {
		...request,
	});
};
