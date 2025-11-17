/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Right, Rights } from '../../store/rights/store';

export const getRights = (rights: Rights, type: string): Array<Record<string, string>> => {
	let right: Array<Record<string, string>> = [];
	const filteredType = rights.filter((item: Right) => item?.type === type);
	// eslint-disable-next-line sonarjs/no-collapsible-if
	if (filteredType && filteredType.length > 0) {
		if (
			filteredType[0]?.all &&
			Array.isArray(filteredType[0]?.all) &&
			filteredType[0]?.all.length > 0
		) {
			right = filteredType[0]?.all[0].right || [];
		}
	}
	return right;
};