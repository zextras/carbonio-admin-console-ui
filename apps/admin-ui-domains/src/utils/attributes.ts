/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Attribute } from '../../types';

export function attributesToObject(attributes: Array<Attribute>): Record<string, string> {
	const map: Record<string, string> = {};
	attributes.forEach((attr) => {
		map[attr.n] = attr._content;
	});
	return map;
}
