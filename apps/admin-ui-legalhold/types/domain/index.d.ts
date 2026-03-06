/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ZimbraAttribute } from '../legalholds';

export type DomainItem = {
	name: string;
	id: string;
	a: Array<ZimbraAttribute>;
};

export type DomainResponse = {
	domain: Array<DomainItem>;
	more: boolean;
	searchTotal: number;
	_jsns: string;
};
