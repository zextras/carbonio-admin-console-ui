/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { GRP, USR } from '../../../../../constants';

export type OwnerTypeSource = {
	id?: string;
	name?: string;
	type?: string;
	email?: string;
};

/**
 * Resolves the grantee type (usr/grp/email) used in addOwners/removeOwners
 * actions, mirroring the original `getOwnerType` logic.
 */
export function resolveOwnerType(sources: Array<OwnerTypeSource>, email?: string): string {
	let type = 'email';
	sources.forEach((item) => {
		if (item?.id && item?.type && item?.email === email) {
			type = item?.type === 'group' || item?.type === GRP ? GRP : USR;
		}
	});
	return type;
}

export function sortOwnersByName<T extends { name?: string }>(owners: Array<T>): Array<T> {
	return [...owners].sort((a, b) =>
		(a?.name?.toLowerCase() || '').localeCompare(b?.name?.toLowerCase() || '')
	);
}
