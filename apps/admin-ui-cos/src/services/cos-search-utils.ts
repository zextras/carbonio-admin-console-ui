/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

function generateAccountSearchFilterQuery(
	searchStr: string,
	cosIdVal: string | undefined,
): string {
	let filterQuery = `(&(zimbraCOSId=${cosIdVal})(!(zimbraIsSystemAccount=TRUE)))`;
	if (searchStr) {
		filterQuery += `(|(mail=*${searchStr}*)(cn=*${searchStr}*)(sn=*${searchStr}*)(gn=*${searchStr}*)(displayName=*${searchStr}*)(zimbraMailDeliveryAddress=*${searchStr}*))`;
	}
	if (searchStr) {
		return `(&${filterQuery})`;
	}
	return filterQuery;
}

function generateDomainSearchFilterQuery(
	searchStr: string,
	cosIdVal: string | undefined,
): string {
	let filterQuery = `(|(zimbraDomainCOSMaxAccounts=${cosIdVal}*)(zimbraDomainDefaultCOSId=${cosIdVal}))`;
	if (searchStr) {
		filterQuery += `(|(zimbraDomainName=*${searchStr}*))`;
	}
	if (searchStr) {
		return `(&${filterQuery})`;
	}
	return filterQuery;
}

export { generateAccountSearchFilterQuery, generateDomainSearchFilterQuery };
