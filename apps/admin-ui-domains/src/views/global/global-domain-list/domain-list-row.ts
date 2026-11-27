/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Attribute } from '../../../../types';
import { attributesToObject } from '../../../utils/attributes';

export type DomainRowItem = {
	id: string;
	name: string;
	zimbraDomainType: string;
	zimbraDomainStatus: string;
	zimbraDomainName: string;
	zimbraId: string;
	description: string;
	zimbraCreateTimestamp: string;
};

export function flattenDomainAttributes(entry: {
	id: string;
	name: string;
	a?: Array<Attribute>;
}): DomainRowItem {
	const map = attributesToObject(entry.a ?? []);
	return {
		id: entry.id,
		name: entry.name,
		zimbraDomainType: map.zimbraDomainType ?? '',
		zimbraDomainStatus: map.zimbraDomainStatus ?? 'active',
		zimbraDomainName: map.zimbraDomainName ?? entry.name,
		zimbraId: map.zimbraId ?? entry.id,
		description: map.description ?? '',
		zimbraCreateTimestamp: map.zimbraCreateTimestamp ?? '',
	};
}
